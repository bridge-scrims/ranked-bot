import { Player, Queue } from "@/database"
import { client } from "@/discord"
import { updateStatus } from "@/workers/functions/updateStatus"
import { onCooldown } from "./cooldown"
import { pollQueue } from "./polling"
import { resetNick, setTempNick } from "./tempNicks"

const playerQueues = new Map<string, string>()
const queues = new Map<string, Map<string, number>>()
Queue.cache.on("add", (queue) => queues.set(queue.id, new Map()))
Queue.cache.on("delete", (queue) => queues.delete(queue.id))

export function addToQueue(queue: Queue, user: string) {
    const member = client.guilds.cache.get(queue.guildId)?.members.cache.get(user)

    if (client.users.cache.get(user)?.bot) return 1
    if (onCooldown(user)) return 2
    if (!Player.getMcUuid(user)) {
        if (member?.voice.channelId === queue.id) setTempNick(queue, user, "USE /REGISTER")
        return 3
    }

    resetNick(queue, user)
    removeFromQueue(user)
    playerQueues.set(user, queue.id)

    const players = queues.get(queue.id)!
    if (!players.has(user)) {
        players.set(user, 0)
        updateStatus(queue).catch(console.error)
        return 0
    }
}

export function getQueueCount(queue: Queue) {
    return queues.get(queue.id)?.size ?? 0
}

export function removeFromQueue(user: string) {
    const queueId = playerQueues.get(user)
    if (queueId !== undefined) {
        queues.get(queueId)!.delete(user)
        playerQueues.delete(user)

        const queue = Queue.cache.get(queueId)
        updateStatus(queue!).catch(console.error)
        return queueId
    }

    return undefined
}

client.on("ready", () => loadQueueMembers())
Queue.cache.initialized().then(() => loadQueueMembers())

let ready = 2
function loadQueueMembers() {
    if (--ready != 0) return
    for (const queue of Queue.cache.values()) {
        const channel = client.guilds.cache.get(queue.guildId)?.channels.cache.get(queue.id)
        if (channel?.isVoiceBased()) {
            for (const member of channel.members.values()) {
                addToQueue(queue, member.id)
            }
        }
    }
}

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return

    const oldQueue = oldState.channelId && Queue.cache.get(oldState.channelId)
    const newQueue = newState.channelId && Queue.cache.get(newState.channelId)

    if (oldQueue) {
        removeFromQueue(newState.id)
        resetNick(oldQueue, newState.id)
    }

    if (newQueue) {
        addToQueue(newQueue, newState.id)
    }
})

setInterval(() => {
    for (const queue of Queue.cache.values()) {
        if (pollQueue(queue, queues.get(queue.id)!) > 0) {
            updateStatus(queue).catch(console.error)
        }
    }
}, 2000)
