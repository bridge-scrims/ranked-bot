import { EmbedBuilder, userMention } from "discord.js"

import { SEASON } from "@/Constants"
import { Player } from "@/database"
import type { Game } from "@/database/models/Game"
import { colors } from "@/discord"
import { Elo, Result } from "@/util/elo"
import { gameLog } from "@/workers/functions/log"
import { archiveGame } from "."

const Stats = {
    Elo: `ranked.${SEASON}.elo`,
    Wins: `ranked.${SEASON}.wins`,
    Losses: `ranked.${SEASON}.losses`,
    Draws: `ranked.${SEASON}.draws`,
    WinStreak: `ranked.${SEASON}.winStreak`,
    BestStreak: `ranked.${SEASON}.bestWinStreak`,
}

export async function scoreGame(game: Game, team1Score: number, team2Score: number) {
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

                await Player.updateOne(
                    { _id: id },
                    updates.map((v) => ({ $set: v })),
                    { upsert: true },
                )
            })
        }),
    )

    const embed = new EmbedBuilder()
        .setColor(colors.baseColor)
        .setTitle(`Game #${game.sequence} Results`)
        .setDescription(`${team1Score} - ${team2Score}`)
        .setFields(
            game.teams.map((team, i) => ({
                name: `Team ${i + 1}`,
                value: team.players
                    .map((id) => `- ${userMention(id)} \`${oldElo[id]}\` **->** \`${newElo[id]}\``)
                    .join("\n"),
                inline: false,
            })),
        )
        .setTimestamp()

    await gameLog(game, { embeds: [embed] })
    return true
}
