import { VoiceState } from "discord.js";

export default {
    name: "voiceStateUpdate",
    once: false,
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        if (!oldState.channelId && newState.channelId) {
            console.log("User joined a channel");
            const memberId = oldState.member?.id;

            console.log(memberId);
        } else if (oldState.channelId && !newState.channelId) {
            console.log("User left a channel");

            const memberId = oldState.member?.id;

            console.log(memberId);
        }
    },
};
