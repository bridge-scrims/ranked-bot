import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../..";
import { getGameByChannelId } from "../../../database/impl/games/impl/get";
import { scoreGame } from "../../../lib/impl/game/scoreGame";

export default {
    name: "score-game",
    description: "Scores a game.",
    options: [
        {
            name: "player-1-score",
            description: "The goals scored by player 1.",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "player-2-score",
            description: "The goals scored by player 2.",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });
            const player1Score = interaction.options.get("player-1-score", true);
            const player2Score = interaction.options.get("player-2-score", true);

            try {
                const game = await getGameByChannelId(interaction.guildId ?? "", interaction.channelId, "textChannel");
                if (!game) {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You can only score the game in the game channel.");
                    return interaction.editReply({ embeds: [embed] });
                }

                await scoreGame(interaction.guildId ?? "", game, player1Score.value as number, player2Score.value as number);
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while scoring this game.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
