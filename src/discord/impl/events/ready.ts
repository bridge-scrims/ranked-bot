import emitter, { Events } from "../../../events";

export default {
    name: "ready",
    once: false,
    execute: async () => {
        await emitter.emit(Events.DISCORD_READY);
    },
};
