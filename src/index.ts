import dotenv from "dotenv";
dotenv.config();

import queues from "./worker";
import emitter, { Events } from "./lib";
import { init } from "./discord";

import colors from "colors";

(async () => {
    emitter.on(Events.COMPLETED_ENTRY_CREATION, async () => {
        // ...
    });

    emitter.on(Events.DISCORD_READY, async () => {
        console.log(colors.green("Discord bot is ready!"));
    });

    emitter.on(Events.DISCORD_COMMAND_REGISTER, async (data) => {
        console.log(colors.gray(`Command registered: ${data.name}`));
    });

    queues.createEntry.start();

    await init();
})();
