import { UserError } from "@/lib/discord/UserError"
import { type MessageComponentInteraction } from "discord.js"
import { getLeaderboard } from "../commands/leaderboard"

export default {
    id: "leaderboard",
    async execute(interaction: MessageComponentInteraction) {
        if (interaction.message.interactionMetadata?.user.id !== interaction.user.id) {
            throw new UserError(
                "You can't edit this leaderboard. " +
                    "Create your own leaderboard with the /leaderboard command.",
            )
        }

        if (interaction.isButton()) {
            const type = interaction.args.shift()!
            const page = parseInt(interaction.args.shift()!)
            const leaderboard = await getLeaderboard(type, page)
            await interaction.update(leaderboard)
        } else if (interaction.isStringSelectMenu()) {
            const type = interaction.values[0]!
            const page = parseInt(interaction.args.shift()!)
            const leaderboard = await getLeaderboard(type, page)
            await interaction.update(leaderboard)
        }
    },
}
