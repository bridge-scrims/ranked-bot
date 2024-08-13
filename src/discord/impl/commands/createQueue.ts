import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { createQueue } from "../../../database/impl/queues/impl/create";
import { colors } from "../..";

export default {
    name: "create-queue",
    description: "Create's a queue for the current guild.",
    options: [
        {
            name: "channel",
            description: "The channel to create the queue in.",
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
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Could not find that channel!");
                return interaction.editReply({ embeds: [embed] });
            }

            if (channel.channel.type !== ChannelType.GuildVoice) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You can only create a queue in a voice channel.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                await createQueue(interaction.guildId ?? "", channel?.channel?.id ?? "", channel?.name || "Unknown");
                const embed = new EmbedBuilder().setColor(colors.successColor).setDescription(`Queue created successfully in <#${channel.channel.id}>.`);
                return interaction.editReply({ embeds: [embed] });
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while creating the queue.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
