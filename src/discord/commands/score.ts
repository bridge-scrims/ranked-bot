import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    InteractionContextType,
    SlashCommandBuilder,
    userMention,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Game } from "@/database/models/Game"
import { colors } from "@/discord"
import { UserError } from "@/lib/discord/UserError"

export default {
    builder: new SlashCommandBuilder()
        .setName("score")
        .setDescription("Sends a score request.")
        .addAttachmentOption((option) =>
            option.setName("screenshot").setDescription("Screenshot of the game results.").setRequired(true),
        )
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })

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

        const teamIdx = game.teams.findIndex((v) => v.players.includes(interaction.user.id))
        if (teamIdx === -1) throw new UserError("Only game participants can send void requests!")

        const scoreEmbed = new EmbedBuilder()
            .setColor(colors.baseColor)
            .setTitle("Score Request")
            .setDescription(`${interaction.user} has requested to score the game. Do you agree?`)
            .setImage(screenshot.url)

        const otherTeam = (teamIdx + 1) % 2
        const scoreButton = new ButtonBuilder()
            .setCustomId(`score:${game.id}:${otherTeam}`)
            .setLabel("Confirm Score")
            .setStyle(ButtonStyle.Success)

        await interaction.channel.send({
            content: game.teams[otherTeam].players.map(userMention).join(" "),
            embeds: [scoreEmbed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(scoreButton)],
        })

        return "Score request sent. The other player must click the button to successfully score the game."
    },
}
