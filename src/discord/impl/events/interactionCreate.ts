import { Interaction } from "discord.js";
import { commands } from "../..";

export default {
    name: "interactionCreate",
    once: false,
    execute: async (interaction: Interaction) => {
        if (!interaction.isCommand()) {
            // Do something
            return;
        }

        const { commandName } = interaction;

        for (const command of commands) {
            if (command.default.name !== commandName) {
                continue;
            }

            await command.default.execute(interaction);
            break;
        }
    },
};
