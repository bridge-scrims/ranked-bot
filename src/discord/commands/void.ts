import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    userMention,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Game } from "@/database/models/Game"
import { colors } from "@/discord"
import { UserError } from "@/lib/discord/UserError"

export default {
    builder: new SlashCommandBuilder()
        .setName("void")
        .setDescription("Voids a game.")
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const game = await Game.findById(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        const teamIdx = game.teams.findIndex((v) => v.includes(interaction.user.id))
        if (teamIdx === -1) throw new UserError("Only game participants can send void requests!")

        if (!interaction.channel!.isSendable())
            throw new Error(`Invalid game channel type ${interaction.channel!.type}`)

        const voidEmbed = new EmbedBuilder()
            .setColor(colors.baseColor)
            .setTitle("Void Request")
            .setDescription(`${interaction.user} has requested to void the game. Do you agree?`)

        const otherTeam = (teamIdx + 1) % 2
        const voidButton = new ButtonBuilder()
            .setCustomId(`void:${game.id}:${otherTeam}`)
            .setLabel("Confirm Void")
            .setStyle(ButtonStyle.Danger)

        await interaction.channel.send({
            content: game.teams[otherTeam]!.map(userMention).join(" "),
            embeds: [voidEmbed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(voidButton)],
        })

        return "Void request sent. The other player must click the button to successfully void the game."
    },
}
