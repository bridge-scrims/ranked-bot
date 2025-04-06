import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"
import { scoreGame } from "@/lib/game/scoreGame"
import { voidGame } from "@/lib/game/voidGame"
import { MessageFlags, type ButtonInteraction } from "discord.js"

export default {
    id: "confirmScore",
    async execute(interaction: ButtonInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const scores = interaction.args.map((v) => parseInt(v))
        const game = await getGame(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        if (scores[0] === -1) {
            const success = await voidGame(game._id)
            if (!success) throw new UserError("This game has already been voided.")
        } else {
            game.winner = scores[0]! > scores[1]! ? 0 : scores[1]! > scores[0]! ? 1 : -1
            game.scores = scores
            game.scorer = interaction.user.id

            const success = await scoreGame(game)
            if (!success) throw new UserError("This game has already been scored.")
        }

        return "Game scored."
    },
}
