import { Player } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { generateStatsCard } from "@/lib/game/generateStatsCard"
import { getUser } from "@/lib/minecraft/scrims/user"
import { AttachmentBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"

export default {
    builder: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Fetches information about an user.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to fetch information about.").setRequired(false),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const user = interaction.options.getUser("user") ?? interaction.user
        const player = await Player.findById(user.id)
        if (!player?.mcUUID) {
            throw new UserError(
                `${interaction.user} is not registered for ranked. ` +
                    `Use the /register command to register.`,
            )
        }

        const scrimsUser = await getUser(player.mcUUID)
        if (!scrimsUser) throw new Error(`Player ${player.mcUUID} not found on Scrims Network.`)

        const image = await generateStatsCard(player, scrimsUser)
        const attachment = new AttachmentBuilder(image, { name: "scorecard.png" })
        await interaction.editReply({ files: [attachment] })
    },
}
