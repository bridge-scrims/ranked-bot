import type { Queue } from "@/database"
import { joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice"
import type { Client } from "discord.js"
import { resetStatus, updateStatus } from "./updateStatus"

export async function joinQueueChannel(client: Client, queue: Queue) {
    const guild = await client.guilds.fetch(queue.guildId)
    const channel = await guild.channels.fetch(queue._id)
    if (channel?.isVoiceBased()) {
        const conn = joinVoiceChannel({
            adapterCreator: guild.voiceAdapterCreator,
            channelId: channel.id,
            guildId: guild.id,
        })

        conn.on("stateChange", (previous, state) => {
            switch (state.status) {
                case VoiceConnectionStatus.Ready:
                    if (guild.voiceStates.cache.get(client.user!.id)?.channelId !== channel.id) {
                        conn.rejoin({ channelId: channel.id, selfDeaf: false, selfMute: false })
                    }
                    updateStatus(queue)
                    break
                case VoiceConnectionStatus.Disconnected:
                    resetStatus(queue)
                    conn.rejoin()
                    break
            }
        })
    }
}
