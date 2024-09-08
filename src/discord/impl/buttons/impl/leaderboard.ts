import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from "discord.js";
import { getLeaderboard } from "../../../../database/impl/players/impl/get";
import { getUser } from "../../../../lib/impl/minecraft/scrims/user";

export default {
    id: "leaderboard",
    execute: async (interaction: Interaction) => {
        if (interaction.isButton()) {
            await interaction.deferUpdate();

            const id = interaction.customId;

            const page = id.split(":")[1];
            const type = id.split(":")[3];

            const leaderboard = await getLeaderboard(interaction.guildId ?? "", type as "elo" | "wins" | "losses" | "best_win_streak", parseInt(page));

            if (!leaderboard || leaderboard.length === 0) {
                return;
            }

            const previousPageButton = new ButtonBuilder()
                .setCustomId(`leaderboard:${String(parseInt(page) - 1)}:previous:${type}`)
                .setLabel("Previous Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(parseInt(page) === 0);
            const nextPageButton = new ButtonBuilder()
                .setCustomId(`leaderboard:${String(parseInt(page) + 1)}:next:${type}`)
                .setLabel("Next Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(leaderboard.length < 10);

            const actionBuilder = new ActionRowBuilder().addComponents(previousPageButton, nextPageButton);

            const embed = new EmbedBuilder().setTitle(interaction.message.embeds[0]?.title ?? "").setColor(interaction.message.embeds[0]?.color ?? null);

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

            description += "```";

            embed.setDescription(description);
            embed.setFooter({ text: `Page ${parseInt(page) + 1}` });

            await interaction.message.edit({ embeds: [embed], components: [actionBuilder as ActionRowBuilder<any>] });
        }
    },
};
