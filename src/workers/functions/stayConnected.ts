import type { Queue } from "@/database"
import { joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice"
import type { Client } from "discord.js"

export async function stayConnected(client: Client, queue: Queue) {
    if (!client.isReady()) return

    const guild = client.guilds.cache.get(queue.guildId)
    const channel = await guild?.channels.fetch(queue.id).catch(() => null)
    if (channel?.isVoiceBased()) {
        const connection = joinVoiceChannel({
            adapterCreator: channel.guild.voiceAdapterCreator,
            channelId: channel.id,
            guildId: channel.guild.id,
        })

        connection.on(VoiceConnectionStatus.Disconnected, () => connection.destroy())
        connection.on(VoiceConnectionStatus.Destroyed, () => stayConnected(client, queue))
    } else {
        console.warn(`Channel for queue ${queue.id} is not joinable!`)
        setTimeout(() => stayConnected(client, queue), 10 * 1000)
    }
}
