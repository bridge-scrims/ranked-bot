import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { getQueue } from "../../../../database/impl/queues/impl/get";
import { colors } from "../../..";

export default {
    name: "get-queue",
    description: "Gets a queue's information.",
    options: [
        {
            name: "channel",
            description: "The channel to get information about.",
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

            try {
                const data = await getQueue(interaction.guildId ?? "", channel?.channel?.id ?? "");
                if (!data) {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`No queue data found for <#${channel?.channel?.id}>.`);
                    return interaction.editReply({ embeds: [embed] });
                }

                const queueEmbed = new EmbedBuilder()
                    .setTitle(`Queue Information`)
                    .setColor(colors.baseColor)
                    .addFields(
                        { name: "Queue ID", value: `\`${data.id}\``, inline: true },
                        { name: "Channel", value: `<#${data.channel_id}>`, inline: true },
                        { name: "Created At", value: `\`${new Date(data.created_at).toLocaleString()}\``, inline: false },
                        { name: "Game Channel ID", value: `<#${data.game_channel_id}>`, inline: true },
                        { name: "Total Players", value: `\`${data.players.length.toString()}\``, inline: true },
                        { name: "Total Workers", value: `\`${data.workers.length.toString()}\``, inline: true },
                    );

                if (data.players.length > 0) {
                    const playerDetails = data.players.map((player) => `**ID**: \`${player.id}\` **User**: <@${player.user_id}> **ELO**: ${Math.round(player.elo)} **Wins**: ${player.wins} **Losses**: ${player.losses} **Streak**: ${player.win_streak}`).join("\n");

                    queueEmbed.addFields({ name: "Players", value: playerDetails, inline: false });
                } else {
                    queueEmbed.addFields({ name: "Players", value: "No players found.", inline: false });
                }

                if (data.workers.length > 0) {
                    const workerDetails = data.workers.map((worker) => `**ID**: \`${worker.id}\` **Client ID**: \`${worker.credentials.client_id}\` **Created At**: <t:${Math.floor(new Date(worker.created_at).getTime() / 1000)}:f>`).join("\n");

                    queueEmbed.addFields({ name: "Workers", value: workerDetails, inline: false });
                } else {
                    queueEmbed.addFields({ name: "Workers", value: "No workers found.", inline: false });
                }

                return interaction.editReply({ embeds: [queueEmbed] });
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
