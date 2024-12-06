import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"
import { voidGame } from "@/lib/game/voidGame"
import { type ButtonInteraction } from "discord.js"

export default {
    id: "void",
    async execute(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const game = await getGame(interaction.args.shift()!)
        if (!game) throw new UserError("Game has already finished!")

        const team = game.teams[parseInt(interaction.args.shift()!)]
        if (!team.players.includes(interaction.user.id))
            throw new UserError("This void request must be accepted by the other team!")

        await interaction.editReply("Voiding game...")
        const success = await voidGame(game.id)
        if (!success) throw new UserError("Game has already been scored!")
    },
}
