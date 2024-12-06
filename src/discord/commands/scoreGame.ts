import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"

import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"
import { scoreGame } from "@/lib/game/scoreGame"

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

        const success = await scoreGame(game, score1, score2)
        if (!success) throw new UserError("This game has already been scored.")

        return "Game scored."
    },
}
