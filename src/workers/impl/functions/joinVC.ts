import { ChannelType } from "discord.js";
import { Worker } from "../../../types";
import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";

export const joinVC = async (worker: Worker, channelId: string): Promise<VoiceConnection | null> => {
    const channel = await worker.client.channels.fetch(channelId);
    if (!channel) return null;

    if (channel.type === ChannelType.GuildVoice) {
        const connection = joinVoiceChannel({
            // @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
            adapterCreator: channel.guild.voiceAdapterCreator,
            channelId: channel.id,
            guildId: channel.guild.id,
        });

        setInterval(() => {
            joinVoiceChannel({
                // @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
                adapterCreator: channel.guild.voiceAdapterCreator,
                channelId: channel.id,
                guildId: channel.guild.id,
            });
        }, 100000);

        return connection;
    }

    return null;
};
