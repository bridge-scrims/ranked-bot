import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../../..";
import { getPlayer } from "../../../../database/impl/players/impl/get";
import { updatePlayer } from "../../../../database/impl/players/impl/update";
import { Player } from "../../../../types";

export default {
    name: "set",
    description: "Sets a player's statistics",
    options: [
        {
            name: "user",
            description: "The user to set the statistics for.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "type",
            description: "The type of statistic to set.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "ELO", value: "elo" },
                { name: "Wins", value: "wins" },
                { name: "Losses", value: "losses" },
                { name: "Win Streak", value: "win_streak" },
                { name: "Best Win Streak", value: "best_win_streak" },
            ],
        },
        {
            name: "value",
            description: "The value to set the statistic to.",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const user = interaction.options.get("user")?.user ?? interaction.user;
            const type = interaction.options.get("type")?.value as string;
            const value = interaction.options.get("value")?.value as number;

            const player = await getPlayer(interaction.guildId ?? "", user.id);
            if (!player) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`User <@${user.id}> not found on Ranked Bridge.`);
                return interaction.editReply({ embeds: [embed] });
            }

            if (!type) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("No statistic type provided.");
                return interaction.editReply({ embeds: [embed] });
            }

            if (!["elo", "wins", "losses", "win_streak", "best_win_streak"].includes(type)) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`Invalid statistic type.`);
                return interaction.editReply({ embeds: [embed] });
            }

            if (isNaN(value)) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Invalid value provided.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                await updatePlayer(interaction.guildId ?? "", player.id, {
                    [type]: value,
                });

                const updatedPlayer = await getPlayer(interaction.guildId ?? "", user.id);
                const embed = new EmbedBuilder().setColor(colors.successColor).setDescription(`Successfully set <@${user.id}>'s ${type} to \`${updatedPlayer![type as keyof Player]}\`.`);
                return interaction.editReply({ embeds: [embed] });
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while setting the statistic.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
