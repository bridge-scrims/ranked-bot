import { EmbedBuilder, bold, userMention } from "discord.js"

import { colors } from "@/discord"
import { gameLog } from "@/lib/game/gameLog"
import { archiveGame, getGame } from "."

export async function voidGame(gameId: string) {
    const game = await getGame(gameId)
    if (!game) return

    const success = await archiveGame(game)
    if (!success) return false

    const embed = new EmbedBuilder()
        .setColor(colors.baseColor)
        .setTitle(`Game #${game.sequence} Voided`)
        .setDescription(
            game.teams
                .map((team, i) => bold(`Team ${i + 1}: `) + team.players.map(userMention).join(", "))
                .join("\n"),
        )
        .setTimestamp()

    gameLog(game, { embeds: [embed] }).catch(console.error)
    return true
}
