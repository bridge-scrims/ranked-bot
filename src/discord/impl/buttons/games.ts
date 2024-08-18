import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from "discord.js";
import { getPlayer } from "../../../database/impl/players/impl/get";
import { getUser } from "../../../lib/impl/minecraft/scrims/user";
import { getGamesByPage, getGamesByPlayer } from "../../../database/impl/games/impl/get";

export default {
    id: "games",
    execute: async (interaction: Interaction) => {
        if (interaction.isButton()) {
            await interaction.deferUpdate();

            const id = interaction.customId;

            const page = id.split(":")[1];
            const player = id.split(":")[3] as string | "NONE";

            const games = player === "NONE" ? await getGamesByPage(interaction.guildId ?? "", parseInt(page)) : await getGamesByPlayer(interaction.guildId ?? "", player, parseInt(page));

            if (!games || games.length === 0) {
                return;
            }

            const previousPageButton = new ButtonBuilder()
                .setCustomId(`games:${String(parseInt(page) - 1)}:previous:${player ?? "NONE"}`)
                .setLabel("Previous Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(parseInt(page) === 0);
            const nextPageButton = new ButtonBuilder()
                .setCustomId(`games:${String(parseInt(page) + 1)}:next:${player ?? "NONE"}`)
                .setLabel("Next Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(games.length < 10);

            const actionBuilder = new ActionRowBuilder().addComponents(previousPageButton, nextPageButton);

            const embed = new EmbedBuilder().setTitle(interaction.message.embeds[0]?.title ?? "").setColor(interaction.message.embeds[0]?.color ?? null);

            let description = "```";

            for (let i = 0; i < games.length; i++) {
                const user = await getPlayer(interaction.guildId ?? "", games[i].player1_id);
                const player1 = await getUser(user?.mc_uuid ?? "");
                const user2 = await getPlayer(interaction.guildId ?? "", games[i].player2_id);
                const player2 = await getUser(user2?.mc_uuid ?? "");

                if (games[i].player1_score === -1 || games[i].player2_score === -1) {
                    description += `${parseInt(page) * 10 + i + 1}. ${player1?.username} vs ${player2?.username}. GAME VOIDED\n`;
                } else {
                    description += `${parseInt(page) * 10 + i + 1}. ${player1?.username} vs ${player2?.username}. Score: ${games[i].player1_score} - ${games[i].player2_score}\n`;
                }
            }

            description += "```";

            embed.setDescription(description);
            embed.setFooter({ text: `Page ${parseInt(page) + 1}` });

            await interaction.message.edit({ embeds: [embed], components: [actionBuilder as ActionRowBuilder<any>] });
        }
    },
};
