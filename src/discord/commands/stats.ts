import {
    ApplicationCommandType,
    AttachmentBuilder,
    ContextMenuCommandBuilder,
    InteractionContextType,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type CommandInteraction,
    type ContextMenuCommandType,
    type User,
    type UserContextMenuCommandInteraction,
} from "discord.js"

import { Player } from "@/database"
import type { InteractionHandler } from "@/lib/discord/InteractionHandler"
import { UserError } from "@/lib/discord/UserError"
import { generateStatsCard } from "@/lib/game/generateStatsCard"
import { getUser } from "@/lib/minecraft/scrims/user"

export default (handler: InteractionHandler) => {
    handler.addCommands(
        {
            builder: new SlashCommandBuilder()
                .setName("ranked-stats")
                .setDescription("Shows you the Ranked Bridge stats of a user.")
                .addUserOption((option) =>
                    option.setName("user").setDescription("The user to show stats for").setRequired(false),
                )
                .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),

            async execute(interaction: ChatInputCommandInteraction) {
                const user = interaction.options.getUser("user") ?? interaction.user
                await execute(interaction, user)
            },
        },
        {
            builder: new ContextMenuCommandBuilder()
                .setName("Ranked Stats")
                .setType(ApplicationCommandType.User as ContextMenuCommandType),

            async execute(interaction: UserContextMenuCommandInteraction) {
                await execute(interaction, interaction.targetUser)
            },
        },
    )
}

async function execute(interaction: CommandInteraction, user: User) {
    await interaction.deferReply()

    const player = await Player.findById(user.id)
    if (!player?.mcUUID) {
        throw new UserError(
            `${interaction.user} is not registered for ranked. ` + `Use the /register command to register.`,
        )
    }

    const scrimsUser = await getUser(player.mcUUID)
    if (!scrimsUser) throw new Error(`Player ${player.mcUUID} not found on Scrims Network.`)

    const image = await generateStatsCard(player, scrimsUser)
    const attachment = new AttachmentBuilder(image, { name: "scorecard.png" })
    await interaction.editReply({ files: [attachment] })
}
