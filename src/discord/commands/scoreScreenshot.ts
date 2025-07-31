import {
    ActionRowBuilder,
    bold,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    userMention,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Game } from "@/database/impl/models/Game"
import { colors } from "@/discord"
import { UserError } from "@/lib/discord/classes/UserError"
import { stringifyScore } from "@/util/scores"

export default {
    builder: new SlashCommandBuilder()
        .setName("score-screenshot")
        .setDescription("Sends a score request to the other team.")
        .addAttachmentOption((option) =>
            option.setName("screenshot").setDescription("Screenshot of the game results.").setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("score")
                .setDescription("Your Score - Opponent Score")
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(5),
        )
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const screenshot = interaction.options.getAttachment("screenshot", true)
        const name = screenshot.name.toLowerCase()

        if (
            !name.endsWith(".jpg") &&
            !name.endsWith(".heic") &&
            !name.endsWith(".png") &&
            !name.endsWith(".jpeg") &&
            !name.endsWith(".gif")
        ) {
            throw new UserError(
                "Invalid file format. Please provide a `.jpg`, `.jpeg`, `.heic`, `.png`, or `.gif` file.",
            )
        }

        const game = await Game.findById(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        if (!interaction.channel!.isSendable())
            throw new Error(`Invalid game channel type ${interaction.channel!.type}`)

        const teamIdx = game.teams.findIndex((v) => v.includes(interaction.user.id))
        if (teamIdx === -1) throw new UserError("Only game participants can send void requests!")

        const scoreInput = interaction.options.getString("score", true)
        const scoreParts = scoreInput.split("-").map((v) => parseInt(v.trim()))
        if (scoreParts.length !== 2 || scoreParts.some((v) => isNaN(v)))
            throw new UserError("Scores should be in format: Your Score - Opponent Score")

        if (teamIdx === 1) scoreParts.reverse()
        const [score1, score2] = scoreParts

        const scoreEmbed = new EmbedBuilder()
            .setColor(colors.baseColor)
            .setTitle("Score Request")
            .setDescription(
                `${interaction.user} has requested to score the game.\n` +
                    `Please confirm ${bold(stringifyScore(game, score1!, score2!))}.`,
            )
            .setImage(screenshot.url)

        const otherTeam = (teamIdx + 1) % 2
        const scoreButton = new ButtonBuilder()
            .setCustomId(`score:${game.id}:${otherTeam}:${score1}:${score2}`)
            .setLabel("Confirm Score")
            .setStyle(ButtonStyle.Success)

        await interaction.channel.send({
            content: game.teams[otherTeam]!.map(userMention).join(" "),
            embeds: [scoreEmbed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(scoreButton)],
        })

        return "Score request sent. The other player must click the button to successfully score the game."
    },
}
