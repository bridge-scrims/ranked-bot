import type { Queue } from "@/database"
import { getQueueCount } from "@/lib/queue"
import { getWorker } from ".."

function setStatus(queue: Queue, status: string | null) {
    const client = getWorker(queue)
    if (client?.guilds.cache.has(queue.guildId)) {
        client.rest.put(`/channels/${queue._id}/voice-status`, { body: { status } }).catch(console.error)
    }
}

const pending = new Set<string>()
const cache = new Map<string, number>()

export function updateStatus(queue: Queue) {
    if (pending.has(queue._id)) return

    pending.add(queue._id)
    queueMicrotask(() => {
        if (!pending.delete(queue._id)) return

        const count = getQueueCount(queue)
        if (cache.get(queue._id) !== count) {
            cache.set(queue._id, count)
            setStatus(queue, `Queued Players: ${count}`)
        }
    })
}

export function resetStatus(queue: Queue) {
    pending.delete(queue._id)
    cache.delete(queue._id)
}

export function clearStatus(queue: Queue) {
    resetStatus(queue)
    setStatus(queue, null)
}
