import { VoiceState } from "discord.js";

export default {
    name: "voiceStateUpdate",
    once: false,
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        if (!oldState.channelId && !newState.channelId) {
            const memberId = oldState.member?.id;

            // Handle queueing here
            console.log(memberId);
        }
    },
};
