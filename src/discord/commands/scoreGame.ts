import {
    bold,
    ButtonStyle,
    InteractionContextType,
    SlashCommandBuilder,
    userMention,
    type ChatInputCommandInteraction,
} from "discord.js"

import { MessageOptionsBuilder } from "@/lib/discord/MessageOptionsBuilder"
import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"

const Options = {
    Team1Score: "team-1-score",
    Team2Score: "team-2-score",
}

export default {
    builder: new SlashCommandBuilder()
        .setName("score-game")
        .setDescription("Scores a game.")
        .addNumberOption((option) =>
            option
                .setName(Options.Team1Score)
                .setDescription("The goals scored by team 1.")
                .setRequired(true),
        )
        .addNumberOption((option) =>
            option
                .setName(Options.Team2Score)
                .setDescription("The goals scored by team 2.")
                .setRequired(true),
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions("0"),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const score1 = interaction.options.getNumber(Options.Team1Score, true)
        const score2 = interaction.options.getNumber(Options.Team2Score, true)

        const game = await getGame(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        const winner = score1 > score2 ? game.teams[0] : score2 > score1 ? game.teams[1] : null
        const score = score1 > score2 ? `${score1}-${score2}` : `${score2}-${score1}`

        await interaction.editReply(
            new MessageOptionsBuilder()
                .setContent(
                    "Please confirm " +
                        bold(
                            winner
                                ? winner.players.map(userMention).join(" ") + ` won ${score}`
                                : "game ended in a draw",
                        ) +
                        ".",
                )
                .addButtons((button) =>
                    button
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`confirmScore:${score1}:${score2}`),
                ),
        )
    },
}
