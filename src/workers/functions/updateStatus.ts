import type { Queue } from "@/database"
import { getQueueCount } from "@/lib/queue"
import { Routes } from "discord.js"
import { getWorker } from ".."

export async function updateStatus(queue: Queue) {
    const client = getWorker(queue)
    if (client?.guilds.cache.has(queue.guildId)) {
        const body = { nick: `@Players: ${getQueueCount(queue)} / 2` }
        await client.rest.patch(Routes.guildMember(queue.guildId, "@me"), { body })
    }
}
