import { Interaction } from "discord.js";
import { commands } from "../..";

export default {
    name: "interactionCreate",
    once: false,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const { commandName } = interaction;

            for (const command of commands) {
                if ((command.default as { name: string }).name !== commandName) {
                    continue;
                }

                await (command.default as any).execute(interaction);
                break;
            }
        }
    },
};
