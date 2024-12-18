import { EmbedBuilder, spoiler, userMention, type User } from "discord.js"

import { Stats } from "@/Constants"
import { Player } from "@/database"
import type { Game } from "@/database/models/Game"
import { colors } from "@/discord"
import { gameLog } from "@/lib/game/gameLog"
import { Elo, Result } from "@/util/elo"
import { stringifyScore } from "@/util/scores"
import { archiveGame } from "."

export async function scoreGame(game: Game, team1Score: number, team2Score: number, scorer: User) {
    const success = await archiveGame(game, [team1Score, team2Score])
    if (!success) return false

    const winner = team1Score === team2Score ? -1 : team2Score > team1Score ? 1 : 0
    const result = winner === 0 ? Result.Team1Win : winner === 1 ? Result.Team2Win : Result.Draw
    const players = game.teams.flatMap((v) => v.players)

    const oldElo = Object.fromEntries(players.map((v) => [v, Player.getRankedElo(v)]))
    const newElo = Elo.calculateDuel(game.teams[0].players, game.teams[1].players, oldElo, result)

    await Promise.all(
        game.teams.flatMap((team, i) => {
            return team.players.map(async (id) => {
                const updates = []
                updates.push({ [Stats.Elo]: newElo[id] })

                if (winner === i) {
                    updates.push(
                        {
                            [Stats.Wins]: { $sum: [`$${Stats.Wins}`, 1] },
                            [Stats.WinStreak]: { $sum: [`$${Stats.WinStreak}`, 1] },
                        },
                        {
                            [Stats.BestStreak]: { $max: [`$${Stats.BestStreak}`, `$${Stats.WinStreak}`] },
                        },
                    )
                } else {
                    const key = winner === -1 ? Stats.Draws : Stats.Losses
                    updates.push({
                        [key]: { $sum: [`$${key}`, 1] },
                        [Stats.WinStreak]: 0,
                    })
                }

                Player.updateElo(id, newElo[id])
                await Player.updateOne(
                    { _id: id },
                    updates.map((v) => ({ $set: v })),
                    { upsert: true },
                )
            })
        }),
    )

    const teams = winner === 1 ? [game.teams[1], game.teams[0]] : game.teams
    const embed = new EmbedBuilder()
        .setColor(colors.baseColor)
        .setTitle(`Game #${game.sequence} Results`)
        .setDescription(stringifyScore(game, team1Score, team2Score) + ".")
        .setFields(
            teams.map((team, i) => ({
                name: winner === -1 ? `Team ${i + 1}` : i === 0 ? "Winner" : "Loser",
                value: team.players
                    .map((id) => `• ${userMention(id)} \`${oldElo[id]}\` **->** \`${newElo[id]}\``)
                    .join("\n"),
                inline: false,
            })),
        )
        .setFooter({ text: `Scored by ${scorer.username}` })
        .setTimestamp()

    const content = spoiler(players.map(userMention).join(" "))
    gameLog(game, { content, embeds: [embed] }).catch(console.error)
    return true
}
