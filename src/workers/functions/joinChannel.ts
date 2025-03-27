import type { Queue } from "@/database"
import { joinVoiceChannel } from "@discordjs/voice"
import type { Client } from "discord.js"

export async function joinQueueChannel(client: Client, queue: Queue) {
    const guild = client.guilds.cache.get(queue.guildId)
    const channel = await guild?.channels.fetch(queue._id).catch(() => null)
    if (channel?.isVoiceBased()) {
        joinVoiceChannel({
            adapterCreator: channel.guild.voiceAdapterCreator,
            channelId: channel.id,
            guildId: channel.guild.id,
        })
    }
}
