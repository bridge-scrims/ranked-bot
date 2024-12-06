import { Player, Queue } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { getUserByUsername } from "@/lib/minecraft/scrims/user"
import { addToQueue } from "@/lib/queue"
import { bold, inlineCode, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"

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
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ign = interaction.options.getString("ign", true)

        const scrimsUser = await getUserByUsername(ign)
        if (!scrimsUser) throw new UserError(`Player ${inlineCode(ign)} not found on Scrims Network.`)
        if (scrimsUser.discordId !== interaction.user.id)
            throw new UserError("Use the ingame /link command to link your Minecraft and Discord first.")

        await Player.setMcUuid(interaction.user.id, scrimsUser._id)

        const voice = interaction.guild?.voiceStates.cache.get(interaction.user.id)
        const queue = Queue.cache.get(voice?.channelId as string)
        if (queue) addToQueue(queue, interaction.user.id)

        return `Registered you as ${bold(ign)}.`
    },
}
