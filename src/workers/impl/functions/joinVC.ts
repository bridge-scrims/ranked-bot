import { ChannelType } from "discord.js";
import { Worker } from "../../../types";
import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";

export const joinVC = async (worker: Worker, channelId: string): Promise<VoiceConnection | null> => {
    const channel = await worker.client.channels.fetch(channelId);
    if (!channel) return null;

    if (channel.type === ChannelType.GuildVoice) {
        const connection = joinVoiceChannel({
            adapterCreator: channel.guild.voiceAdapterCreator,
            channelId: channel.id,
            guildId: channel.guild.id,
        });

        setInterval(() => {
            joinVoiceChannel({
                adapterCreator: channel.guild.voiceAdapterCreator,
                channelId: channel.id,
                guildId: channel.guild.id,
            });
        }, 100000);

        return connection;
    }

    return null;
};
