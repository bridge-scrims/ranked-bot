import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, Interaction } from "discord.js";
import { createQueue } from "../../../database/impl/queues/impl/create";

export default {
    name: "create-queue",
    description: "Create's a queue for the current guild.",
    options: [
        {
            name: "channel",
            description: "The channel to create the queue in.",
            type: ApplicationCommandOptionType.Channel,
        },
    ],
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.options.get("channel");
            if (!channel || !channel.channel) {
                return interaction.editReply("You must provide a channel to create the queue in.");
            }

            try {
                await createQueue(interaction.guildId ?? "", channel?.channel?.id ?? "", channel?.name || "Unknown");
                return interaction.editReply(`Queue created in ${channel.name}`);
            } catch (e) {
                console.error(e);
                return interaction.editReply("An error occurred while creating the queue.");
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
