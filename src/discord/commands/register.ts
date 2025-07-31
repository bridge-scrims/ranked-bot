import { Player } from "@/database"
import { UserError } from "@/lib/discord/classes/UserError"
import { getUserByUsername } from "@/lib/minecraft/scrims"
import { updateQueueStatus } from "@/lib/queue"
import {
    bold,
    inlineCode,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js"

export default {
    builder: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Registeres you for ranked Bridge.")
        .addStringOption((option) =>
            option
                .setName("ign")
                .setDescription("Your Minecraft username.")
                .setMinLength(3)
                .setMaxLength(16)
                .setRequired(true),
        )
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),

    async execute(interaction: ChatInputCommandInteraction<undefined>) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const ign = interaction.options.getString("ign", true)

        const scrimsUser = await getUserByUsername(ign)
        if (!scrimsUser) throw new UserError(`Player ${inlineCode(ign)} not found on Scrims Network.`)
        if (scrimsUser.discordId !== interaction.user.id)
            throw new UserError("Use the ingame /link command to link your Minecraft and Discord first.")

        await Player.setMcUuid(interaction.user.id, scrimsUser._id)
        await updateQueueStatus(interaction.user.id)

        return `Registered you as ${bold(ign)}.`
    },
}
