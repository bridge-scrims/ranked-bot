import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"
import { scoreGame } from "@/lib/game/scoreGame"
import { voidGame } from "@/lib/game/voidGame"
import { type ButtonInteraction } from "discord.js"

export default {
    id: "confirmScore",
    async execute(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const score1 = parseInt(interaction.args.shift()!)
        const score2 = parseInt(interaction.args.shift()!)

        const game = await getGame(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        if (score1 === -1 || score2 === -1) {
            const success = await voidGame(game.id)
            if (!success) throw new UserError("This game has already been voided.")
        } else {
            const success = await scoreGame(game, score1, score2)
            if (!success) throw new UserError("This game has already been scored.")
        }

        return "Game scored."
    },
}
