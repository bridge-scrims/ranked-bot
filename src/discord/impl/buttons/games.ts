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
                const team1 = await Promise.all(games[i].team1_ids.map(async (id) => await getPlayer(interaction.guildId ?? "", id)));
                const team2 = await Promise.all(games[i].team2_ids.map(async (id) => await getPlayer(interaction.guildId ?? "", id)));

                const team1Mc = await Promise.all(team1.map(async (player) => await getUser(player?.mc_uuid ?? "")));
                const team2Mc = await Promise.all(team2.map(async (player) => await getUser(player?.mc_uuid ?? "")));

                if (games[i].team1_score === -1 || games[i].team2_score === -1) {
                    description += `${parseInt(page) * 10 + i + 1}. ${team1Mc.map((player) => player?.username).join(", ")} vs ${team2Mc.map((player) => player?.username).join(", ")}. GAME VOIDED\n`;
                } else {
                    description += `${parseInt(page) * 10 + i + 1}. ${team1Mc.map((player) => player?.username).join(", ")} vs ${team2Mc.map((player) => player?.username).join(", ")}. Score: ${games[i].team1_score} - ${games[i].team2_score}\n`;
                }
            }

            description += "```";

            embed.setDescription(description);
            embed.setFooter({ text: `Page ${parseInt(page) + 1}` });

            await interaction.message.edit({ embeds: [embed], components: [actionBuilder as ActionRowBuilder<any>] });
        }
    },
};
