import type { Game } from "@/database"
import { userMention } from "discord.js"

export function stringifyScore(game: Game, score1: number, score2: number) {
    if (score1 === -1 || score2 === -1) return "game should be voided"

    const winner = score1 > score2 ? game.teams[0] : score2 > score1 ? game.teams[1] : null
    const score = score1 > score2 ? `${score1}-${score2}` : `${score2}-${score1}`
    return winner ? winner.players.map(userMention).join(" ") + ` won ${score}` : "game ended in a draw"
}
