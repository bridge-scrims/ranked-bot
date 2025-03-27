import type { Queue } from "@/database"
import { Routes } from "discord.js"
import { getWorker } from ".."

export async function updateNick(queue: Queue, userId: string, nick: string | null) {
    await getWorker(queue)?.rest.patch(Routes.guildMember(queue.guildId, userId), { body: { nick } })
}
