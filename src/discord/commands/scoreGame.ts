import {
    bold,
    ButtonStyle,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js"

import { MessageOptionsBuilder } from "@/lib/discord/classes/MessageOptionsBuilder"
import { UserError } from "@/lib/discord/classes/UserError"
import { getGame } from "@/lib/game"
import { stringifyScore } from "@/util/scores"

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
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName(Options.Team2Score)
                .setDescription("The goals scored by team 2.")
                .setRequired(false),
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions("0"),

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const score1 = interaction.options.getNumber(Options.Team1Score) ?? -1
        const score2 = interaction.options.getNumber(Options.Team2Score) ?? -1

        const game = await getGame(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        await interaction.editReply(
            new MessageOptionsBuilder()
                .setContent(`Please confirm ${bold(stringifyScore(game, score1, score2))}.`)
                .addButtons((button) =>
                    button
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`confirmScore:${score1}:${score2}`),
                ),
        )
    },
}
