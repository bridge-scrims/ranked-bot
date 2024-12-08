import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"
import { closeChannel } from "@/lib/game/closeChannel"
import { type ButtonInteraction } from "discord.js"

export default {
    id: "score",
    async execute(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const game = await getGame(interaction.args.shift()!)
        if (!game) throw new UserError("Game has already finished!")

        const team = game.teams[parseInt(interaction.args.shift()!)]
        if (!team.players.includes(interaction.user.id))
            throw new UserError("This score request must be accepted by the other team.")

        const score1 = parseInt(interaction.args.shift() ?? "0")
        const score2 = parseInt(interaction.args.shift() ?? "0")

        await interaction.editReply("Closing channel...")
        const success = await closeChannel(game, score1, score2, interaction.message.embeds[0]?.image?.url)
        if (!success) throw new UserError("Channel already closed!")
    },
}
