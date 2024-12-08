import { Queue } from "@/database"
import type { Game } from "@/database/models/Game"
import { client } from "@/discord"
import type { MessageCreateOptions } from "discord.js"

export async function gameLog(game: Game, message: MessageCreateOptions) {
    const queue = Queue.cache.get(game.queueId!)
    if (queue) await log(queue.gameLog, message)
}

async function log(channelId: string, message: MessageCreateOptions) {
    const channel = await client?.channels.fetch(channelId).catch(() => null)
    if (channel?.isSendable()) {
        await channel.send(message)
    }
}
