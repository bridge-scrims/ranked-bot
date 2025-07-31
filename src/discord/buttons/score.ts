import { UserError } from "@/lib/discord/classes/UserError"
import { getGame } from "@/lib/game"
import { closeChannel } from "@/lib/game/impl/closeChannel"
import { MessageFlags, type ButtonInteraction } from "discord.js"

export default {
    id: "score",
    async execute(interaction: ButtonInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const game = await getGame(interaction.args.shift()!)
        if (!game) throw new UserError("Game has already finished!")

        const team = game.teams[parseInt(interaction.args.shift()!)]!
        if (!team.includes(interaction.user.id))
            throw new UserError("This score request must be accepted by the other team.")

        const [score1, score2] = interaction.args.map((v) => parseInt(v))

        await interaction.editReply("Closing channel...")
        const success = await closeChannel(game, score1!, score2!, interaction.message.embeds[0]?.image?.url)
        if (!success) throw new UserError("Channel already closed!")
    },
}
