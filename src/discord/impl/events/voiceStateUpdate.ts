import { VoiceState } from "discord.js";
import { add } from "../../../lib/impl/queue/add";
import { remove } from "../../../lib/impl/queue/remove";
import { interval } from "../../../lib/impl/queue/interval";

export default {
    name: "voiceStateUpdate",
    once: false,
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        if (!oldState.channelId && newState.channelId) {
            await add(newState.guild.id, newState.channelId, newState.member?.id ?? oldState.member?.id ?? "");
            await interval(newState.guild.id, newState.channelId, newState.member?.id ?? oldState.member?.id ?? "", 0);
        } else if (oldState.channelId && !newState.channelId) {
            await remove(newState.guild.id, newState.channelId ?? oldState.channelId ?? "", newState.member?.id ?? oldState.member?.id ?? "");
        }
    },
};
