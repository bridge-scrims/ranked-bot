import { MessageCreateOptions, MessagePayload } from "discord.js";
import { Worker } from "../../../types";

export const sendMessageInChannel = async (worker: Worker, channelId: string, message: string | MessagePayload | MessageCreateOptions) => {
    const channel = worker.client.channels.cache.get(channelId);
    if (!channel) return;

    if (channel.isTextBased()) {
        await channel.send(message);
    }
};
