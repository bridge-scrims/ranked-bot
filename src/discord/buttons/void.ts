import { UserError } from "@/lib/discord/classes/UserError"
import { getGame } from "@/lib/game"
import { voidGame } from "@/lib/game/impl/voidGame"
import { MessageFlags, type ButtonInteraction } from "discord.js"

export default {
    id: "void",
    async execute(interaction: ButtonInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const game = await getGame(interaction.args.shift()!)
        if (!game) throw new UserError("Game has already finished!")

        const team = game.teams[parseInt(interaction.args.shift()!)]!
        if (!team.includes(interaction.user.id))
            throw new UserError("This void request must be accepted by the other team!")

        await interaction.editReply("Voiding game...")
        const success = await voidGame(game._id)
        if (!success) throw new UserError("Game has already been scored!")
    },
}
