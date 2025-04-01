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

export function addToQueue(queue: Queue, user: string) {
    console.log("Queue", user)

    if (client.users.cache.get(user)?.bot) return QueueResult.Bot
    if (!Player.getMcUuid(user)) {
        setChannelNick(queue, user, "USE /REGISTER")
        return QueueResult.NotRegistered
    }

    console.log("Queue2", user)
    const party = Party.get(user)
    if (party) {
        if (!party.isLeader(user)) {
            setChannelNick(queue, user, "NOT PARTY LEADER")
            return QueueResult.NotLeader
        }

        if (party.getMembers().length > queue.teamSize) {
            setChannelNick(queue, user, "PARTY TOO BIG")
            return QueueResult.InvalidParty
        }
    }

    console.log("Queue3", user)
    const users = party?.getMembers() ?? [user]
    if (onCooldown(user)) return QueueResult.OnCooldown
    if (playerQueues.get(user) === queue._id) return QueueResult.AlreadyQueued

    users.forEach((user) => {
        resetChannelNick(queue, user)
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
    console.log(Array.from(queues.get(queue._id)!.values()))
    return Array.from(queues.get(queue._id)!.values()).reduce((pv, cv) => pv + cv.getPlayers().length, 0)
}

export function removeParticipantFromQueue(user: string) {
    const queueId = playerQueues.get(user)
    if (queueId !== undefined) {
        if (!queues.get(queueId)!.delete(user)) {
            return false
        }

        playerQueues.delete(user)

        const queue = Queue.cache.get(queueId)!
        updateStatus(queue)
        return queue
    }

    return undefined
}

client.once("ready", () =>
    Promise.all([Queue.cache.initialized(), Player.cacheInitialize(), Party.initialized()]).then(() =>
        loadQueueMembers(),
    ),
)
function loadQueueMembers() {
    for (const queue of Queue.cache.values()) {
        const channel = client.guilds.cache.get(queue.guildId)?.channels.cache.get(queue._id)
        if (channel?.isVoiceBased()) {
            for (const member of channel.members.values()) {
                addToQueue(queue, member.id)
            }
        }
    }
}

export function updateQueueStatus(player: string) {
    for (const guild of client.guilds.cache.values()) {
        const member = guild.members.cache.get(player)
        if (member?.voice.channelId) {
            const queue = Queue.cache.get(member.voice.channelId)
            if (queue) {
                addToQueue(queue, player)
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
        addToQueue(newQueue, newState.id)
    }
})

onCooldownExpire((player) => updateQueueStatus(player))
Party.onUpdate((party) => {
    const previous = playerQueues.get(party.leader.id)
    party.getMembers().forEach((v) => removeParticipantFromQueue(v))

    if (previous) {
        const queue = Queue.cache.get(previous)!
        addToQueue(queue, party.leader.id)
    }
})

setInterval(() => {
    for (const queue of Queue.cache.values()) {
        if (pollQueue(queue, queues.get(queue._id)!) > 0) {
            updateStatus(queue)
        }
    }
}, 2000)
