import { Interaction } from "discord.js";
import { getLeaderboard } from "../../../database/impl/players/impl/get";
import { getUser } from "../../../lib/impl/minecraft/scrims/user";

export default {
    id: "leaderboard",
    execute: async (interaction: Interaction) => {
        if (interaction.isButton()) {
            const id = interaction.customId;

            const page = id.split(":")[1];
            const type = id.split(":")[3];
            //const direction = id.split(":")[2] as "next" | "previous";

            const leaderboard = await getLeaderboard(interaction.guildId ?? "", type as "elo" | "wins" | "losses" | "best_win_streak", parseInt(page));

            if (!leaderboard || leaderboard.length === 0) {
                return;
            }

            const embed = interaction.message.embeds[0];

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

            Object.assign(embed, {
                description: `${description}\`\`\``,
                footer: { text: `Page ${parseInt(page) + 1}` },
            });

            await interaction.update({ embeds: [embed] });
        }
    },
};
