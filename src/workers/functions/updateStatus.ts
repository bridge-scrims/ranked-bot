import type { Queue } from "@/database"
import { getQueueCount } from "@/lib/queue"
import { getWorker } from ".."

function setStatus(queue: Queue, status: string | null) {
    const client = getWorker(queue)
    if (client?.guilds.cache.has(queue.guildId)) {
        client.rest.put(`/channels/${queue._id}/voice-status`, { body: { status } }).catch(console.error)
    }
}

export function updateStatus(queue: Queue) {
    setStatus(queue, `Queued Players: ${getQueueCount(queue)}`)
}

export function clearStatus(queue: Queue) {
    setStatus(queue, null)
}
