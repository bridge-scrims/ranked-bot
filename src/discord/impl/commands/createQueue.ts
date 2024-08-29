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
        {
            name: "game-channel",
            description: "The channel to post games in.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: "client-id",
            description: "The client id of the worker.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "client-token",
            description: "The client token of the worker.",
            type: ApplicationCommandOptionType.String,
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

            const gameChannel = interaction.options.get("game-channel");
            if (!gameChannel || !gameChannel.channel) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Could not find that game channel!");
                return interaction.editReply({ embeds: [embed] });
            }

            const clientId = interaction.options.get("client-id");
            if (!clientId || !clientId.value) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Please provide a client id for the worker.");
                return interaction.editReply({ embeds: [embed] });
            }

            const clientToken = interaction.options.get("client-token");
            if (!clientToken || !clientToken.value) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Please provide a client token for the worker.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                await interaction.client.users.fetch(clientId.value as string);
            } catch {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`Could not find the worker <@${clientId.value}>. Please invite them to the server!`);
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                await createQueue(interaction.guildId ?? "", channel?.channel?.id ?? "", channel?.name || "Unknown", gameChannel?.channel?.id ?? "", [
                    {
                        client_id: clientId.value as string,
                        client_token: clientToken.value as string,
                    },
                ]);
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
