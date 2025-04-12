import { Player, Queue } from "@/database"
import { client } from "@/discord"
import { updateStatus } from "@/workers/functions/updateStatus"
import { Party } from "../party"
import { onCooldown, onCooldownExpire } from "./cooldown"
import { resetChannelNick, setChannelNick } from "./nicks"
import { GroupQueueParticipant, QueueParticipant, SoloQueueParticipant } from "./participant"
import { pollQueue } from "./polling"

const playerQueues = new Map<string, string>()
const queues = new Map<string, Map<string, QueueParticipant>>()
Queue.cache.on("add", (queue) => queues.set(queue._id, new Map()))
Queue.cache.on("delete", (queue) => queues.delete(queue._id))

export enum QueueResult {
    Success,
    Bot,
    NotRegistered,
    NotLeader,
    InvalidParty,
    OnCooldown,
    AlreadyQueued,
}

export async function addToQueue(queue: Queue, user: string) {
    if (client.users.cache.get(user)?.bot) return QueueResult.Bot

    await Player.cacheInitialized()
    if (!Player.getMcUuid(user)) {
        setChannelNick(queue, user, "USE /REGISTER")
        return QueueResult.NotRegistered
    }

    const party = await Party.get(user)
    if (party) {
        if (!party.isLeader(user)) {
            return QueueResult.NotLeader
        }

        if (party.getMembers().length > queue.teamSize) {
            setChannelNick(queue, user, "PARTY TOO BIG")
            return QueueResult.InvalidParty
        }
    }

    const users = party?.getMembers() ?? [user]
    users.forEach((user) => resetChannelNick(queue, user))

    if (onCooldown(user)) return QueueResult.OnCooldown
    if (playerQueues.get(user) === queue._id) return QueueResult.AlreadyQueued

    users.forEach((user) => {
        removeParticipantFromQueue(user)
        playerQueues.set(user, queue._id)
    })

    const participants = queues.get(queue._id)!
    if (party) {
        participants.set(user, new GroupQueueParticipant(party.getMembers()))
    } else {
        participants.set(user, new SoloQueueParticipant(user))
    }

    updateStatus(queue)
    return QueueResult.Success
}

export function getQueueCount(queue: Queue) {
    return Array.from(queues.get(queue._id)!.values()).reduce((pv, cv) => pv + cv.getPlayers().length, 0)
}

export function removeParticipantFromQueue(user: string) {
    const queueId = playerQueues.get(user)
    if (queueId !== undefined) {
        const participants = queues.get(queueId)!
        const entry = participants.get(user)
        if (entry === undefined) {
            return false
        }

        participants.delete(user)
        entry?.getPlayers().forEach((v) => playerQueues.delete(v))

        const queue = Queue.cache.get(queueId)!
        updateStatus(queue)
        return queue
    }

    return undefined
}

client.once("ready", () => Queue.cache.initialized().then(() => loadQueueMembers()))
function loadQueueMembers() {
    for (const queue of Queue.cache.values()) {
        const channel = client.guilds.cache.get(queue.guildId)?.channels.cache.get(queue._id)
        if (channel?.isVoiceBased()) {
            for (const member of channel.members.values()) {
                addToQueue(queue, member.id).catch(console.error)
            }
        }
    }
}

export async function updateQueueStatus(player: string) {
    for (const guild of client.guilds.cache.values()) {
        const member = guild.members.cache.get(player)
        if (member?.voice.channelId) {
            const queue = Queue.cache.get(member.voice.channelId)
            if (queue) {
                await addToQueue(queue, player)
                break
            }
        }
    }
}

client.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return

    const oldQueue = oldState.channelId && Queue.cache.get(oldState.channelId)
    const newQueue = newState.channelId && Queue.cache.get(newState.channelId)

    if (oldQueue) {
        removeParticipantFromQueue(newState.id)
        resetChannelNick(oldQueue, newState.id)
    }

    if (newQueue) {
        addToQueue(newQueue, newState.id).catch(console.error)
    }
})

onCooldownExpire((player) => updateQueueStatus(player).catch(console.error))
Party.onUpdate((party) => {
    const previous = playerQueues.get(party.leader.id)
    if (previous) {
        // Remove old party from the queue
        const entries = queues.get(previous)!
        const entry = entries.get(party.leader.id)!
        entries.delete(party.leader.id)
        entry.getPlayers().forEach((v) => playerQueues.delete(v))
    }

    // Remove new party members from the queue
    party.getMembers().forEach((v) => removeParticipantFromQueue(v))

    if (previous) {
        // Add new party to the queue
        addToQueue(Queue.cache.get(previous)!, party.leader.id).catch(console.error)
    }
})

setInterval(() => {
    for (const queue of Queue.cache.values()) {
        if (pollQueue(queue, queues.get(queue._id)!) > 0) {
            updateStatus(queue)
        }
    }
}, 2000)
