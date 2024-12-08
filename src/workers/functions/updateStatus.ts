import type { Queue } from "@/database"
import { getQueueCount } from "@/lib/queue"
import { getWorker } from ".."

export async function updateStatus(queue: Queue) {
    const client = getWorker(queue)
    if (client?.guilds.cache.has(queue.guildId)) {
        const body = { status: `Queued Players: ${getQueueCount(queue)}` }
        await client.rest.put(`/channels/${queue._id}/voice-status`, { body })
    }
}
