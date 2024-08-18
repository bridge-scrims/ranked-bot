import { ActionRowBuilder, ApplicationCommandDataResolvable, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../..";
import { getLeaderboard } from "../../../database/impl/players/impl/get";
import { getUser } from "../../../lib/impl/minecraft/scrims/user";

export default {
    name: "leaderboard",
    description: "Displays the current Ranked Bridge leaderboard.",
    options: [
        {
            name: "type",
            description: "The type of leaderboard to display.",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "ELO",
                    value: "elo",
                },
                {
                    name: "Wins",
                    value: "wins",
                },
                {
                    name: "Losses",
                    value: "losses",
                },
                {
                    name: "Best Win Streak",
                    value: "best_win_streak",
                },
            ],
            required: false,
        },
        {
            name: "page",
            description: "The page of the leaderboard to display.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply();
            const type = interaction.options.get("type") ? (interaction.options.get("type")?.value as string) : "elo";
            const page = interaction.options.get("page") ? (interaction.options.get("page")?.value as number) : 0;

            const leaderboard = await getLeaderboard(interaction.guildId ?? "", type as "elo" | "wins" | "losses" | "best_win_streak", page);
            if (!leaderboard || leaderboard.length === 0) {
                await interaction.editReply("No players found.");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Leaderboard | ${type.toUpperCase()}`)
                .setColor(colors.baseColor)
                .setFooter({ text: `Page ${page + 1}` })
                .setTimestamp();

            let description = "```";

            for (let i = 0; i < leaderboard.length; i++) {
                const player = await getUser(leaderboard[i].mc_uuid);
                if (!player || !player.username) {
                    description += `${(i + 1).toString().padEnd(3, " ")}ERROR FETCHING USER\n`;
                    continue;
                }
                switch (type) {
                    case "elo":
                        description += `${(i + 1).toString().padEnd(3, " ")}${player.username.toString().padEnd(17, " ")} ${Math.round(leaderboard[i].elo).toString().padEnd(4, " ")}\n`;
                        break;
                    case "wins":
                        description += `${(i + 1).toString().padEnd(3, " ")}${player.username.toString().padEnd(17, " ")} ${leaderboard[i].wins.toString().padEnd(4, " ")}\n`;
                        break;
                    case "losses":
                        description += `${(i + 1).toString().padEnd(3, " ")}${player.username.toString().padEnd(17, " ")} ${leaderboard[i].losses.toString().padEnd(4, " ")}\n`;
                        break;
                    case "best_win_streak":
                        description += `${(i + 1).toString().padEnd(3, " ")}${player.username.toString().padEnd(17, " ")} ${leaderboard[i].best_win_streak.toString().padEnd(4, " ")}\n`;
                        break;
                    default:
                        break;
                }
            }

            embed.setDescription(description + "```");

            const previousPageButton = new ButtonBuilder()
                .setCustomId(`leaderboard:${page - 1}:previous:${type}`)
                .setLabel("Previous Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(page === 0);
            const nextPageButton = new ButtonBuilder()
                .setCustomId(`leaderboard:${page + 1}:next:${type}`)
                .setLabel("Next Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(leaderboard.length < 10);

            const actionBuilder = new ActionRowBuilder().addComponents(previousPageButton, nextPageButton);

            await interaction.editReply({ embeds: [embed], components: [actionBuilder as ActionRowBuilder<any>] });
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
