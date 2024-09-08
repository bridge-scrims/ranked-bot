import { EmbedBuilder, Interaction } from "discord.js";
import { voidGame } from "../../../lib/impl/game/voidGame";
import { colors } from "../..";
import { getGame } from "../../../database/impl/games/impl/get";

export default {
    id: "void",
    execute: async (interaction: Interaction) => {
        if (interaction.isButton()) {
            const id = interaction.customId;

            const gameId = id.split(":")[1];
            const otherTeam: string[] = JSON.parse(id.split(":")[2]);

            await interaction.deferReply({ ephemeral: true });

            if (!otherTeam.includes(interaction.user.id)) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(
                    `Only ${otherTeam
                        .map((id) => {
                            return `<@${id}>`;
                        })
                        .join(", ")} can accept the score request.`,
                );
                return await interaction.editReply({ embeds: [embed] });
            }

            const game = await getGame(interaction.guildId ?? "", gameId);
            if (game?.team1_score !== 0 && game?.team2_score !== 0) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("The game has already been scored or voided.");
                return await interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Voiding game...");
            await interaction.editReply({ embeds: [embed] });

            await voidGame(interaction.guildId ?? "", gameId);
        }
    },
};
