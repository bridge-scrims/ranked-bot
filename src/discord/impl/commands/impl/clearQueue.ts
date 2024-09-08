import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../../..";
import { clearQueue } from "../../../../database/impl/queues/impl/clear";

export default {
    name: "clear-queue",
    description: "Clears the queue.",
    options: [
        {
            name: "channel",
            description: "The queue channel.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.options.get("channel");
            if (!channel || !channel.channel) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Could not find that channel! Create a queue via `/create-queue`.");
                return interaction.editReply({ embeds: [embed] });
            }

            await clearQueue(interaction.guildId ?? "", channel?.channel?.id ?? "");

            const embed = new EmbedBuilder().setColor(colors.successColor).setDescription(`Queue cleared for <#${channel?.channel?.id}>.`);
            return interaction.editReply({ embeds: [embed] });
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
