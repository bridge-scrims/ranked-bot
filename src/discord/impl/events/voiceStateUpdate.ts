import { VoiceState } from "discord.js";
import { add } from "../../../lib/impl/queue/add";
import { remove } from "../../../lib/impl/queue/remove";
import { getQueue } from "../../../database/impl/queues/impl/get";

export default {
    name: "voiceStateUpdate",
    once: false,
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        if (!oldState.channelId && newState.channelId) {
            // If the player joins a VC
            await add(newState.guild.id, newState.channelId, newState.member?.id ?? oldState.member?.id ?? "");
        } else if (oldState.channelId && !newState.channelId) {
            // If the player leaves a VC
            await remove(newState.guild.id, newState.channelId ?? oldState.channelId ?? "", newState.member?.id ?? oldState.member?.id ?? "");
        } else if (newState.channelId) {
            // If the player moves VC's (or is dragged)
            const queue = await getQueue(newState.guild.id, newState.channelId);
            if (queue) {
                await add(newState.guild.id, newState.channelId, newState.member?.id ?? oldState.member?.id ?? "");
            } else if (oldState.channelId) {
                const queue = await getQueue(newState.guild.id, oldState.channelId);
                if (queue) {
                    await remove(newState.guild.id, oldState.channelId, newState.member?.id ?? oldState.member?.id ?? "");
                }
            }
        }
    },
};
