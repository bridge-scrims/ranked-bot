import { EmbedBuilder, Interaction } from "discord.js";
import { closeChannel } from "../../../lib/impl/game/closeChannel";
import { colors } from "../..";
import { getGame } from "../../../database/impl/games/impl/get";

export default {
    id: "score",
    execute: async (interaction: Interaction) => {
        if (interaction.isButton()) {
            const id = interaction.customId;

            const gameId = id.split(":")[1];
            const otherPlayer = id.split(":")[2];

            await interaction.deferReply({ ephemeral: true });

            if (interaction.user.id !== otherPlayer) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`<@${otherPlayer}> must accept the score request.`);
                return await interaction.editReply({ embeds: [embed] });
            }

            const game = await getGame(interaction.guildId ?? "", gameId);
            if (game?.player1_score !== 0 && game?.player2_score !== 0) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("The game has already been scored or voided.");
                return await interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Closing channel...");
            await interaction.editReply({ embeds: [embed] });

            await closeChannel(interaction.guildId ?? "", gameId);
        }
    },
};
