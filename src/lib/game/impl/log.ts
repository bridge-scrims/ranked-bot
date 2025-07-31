import { Queue } from "@/database"
import type { Game } from "@/database/impl/models/Game"
import { client } from "@/discord"
import type { MessageCreateOptions } from "discord.js"

export async function gameLog(game: Game, message: MessageCreateOptions) {
    if (!game.queueId) return
    const queue = Queue.cache.get(game.queueId)
    if (queue && queue.gameLog) await log(queue.gameLog, message)
}

export async function queueLog(game: Game, message: MessageCreateOptions) {
    if (!game.queueId) return
    const queue = Queue.cache.get(game.queueId)
    if (queue && queue.queueLog) await log(queue.queueLog, message)
}

async function log(channelId: string, message: MessageCreateOptions) {
    const channel = await client?.channels.fetch(channelId).catch(() => null)
    if (channel?.isSendable()) {
        await channel.send(message)
    }
}
