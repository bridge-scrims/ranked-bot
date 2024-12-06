import { Queue } from "@/database"
import type { Game } from "@/database/models/Game"
import type { MessageCreateOptions } from "discord.js"
import { getWorker } from ".."

export async function gameLog(game: Game, message: MessageCreateOptions) {
    const queue = Queue.cache.get(game.queueId!)
    if (queue) await log(queue, queue.gameLog, message)
}

export async function queueLog(queue: Queue, message: MessageCreateOptions) {
    await log(queue, queue.queueLog, message)
}

export async function log(queue: Queue, channelId: string, message: MessageCreateOptions) {
    const client = getWorker(queue)
    const channel = await client?.channels.fetch(channelId).catch(() => null)
    if (channel?.isSendable()) {
        await channel.send(message)
    }
}
