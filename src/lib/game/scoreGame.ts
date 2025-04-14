import { EmbedBuilder, EmbedField, spoiler, userMention } from "discord.js"

import { Stats } from "@/Constants"
import { Player } from "@/database"
import type { Game } from "@/database/models/Game"
import { client, colors } from "@/discord"
import { gameLog, queueLog } from "@/lib/game/log"
import { Elo, Result } from "@/util/elo"
import { stringifyResult, stringifyScore } from "@/util/scores"
import { archiveGame } from "."

export async function scoreGame(game: Game) {
    const result = game.winner === 0 ? Result.Team1Win : game.winner === 1 ? Result.Team2Win : Result.Draw
    const players = game.teams.flatMap((v) => v)

    const oldElo = Object.fromEntries(players.map((v) => [v, Player.getRankedElo(v)]))
    const newElo = Elo.calculateDuel(game.teams[0]!, game.teams[1]!, oldElo, result)
    game.elo = Object.entries(oldElo).map(([id, old]) => ({ id, old, new: newElo[id]! }))

    const success = await archiveGame(game)
    if (!success) return false

    updateStats(game, newElo).catch(console.error)

    const teams = getTeams(game, oldElo, newElo)
    sendGameLog(game, players, teams)
    sendQueueLog(game, teams)

    return true
}

async function updateStats(game: Game, elos: Record<string, number>) {
    await Promise.all(
        game.teams.flatMap((team, i) => {
            return team.map(async (id) => {
                const updates = []
                updates.push({ [Stats.Elo]: elos[id] })

                if (game.winner === i) {
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
                    const key = game.winner === -1 ? Stats.Draws : Stats.Losses
                    updates.push({
                        [key]: { $sum: [`$${key}`, 1] },
                        [Stats.WinStreak]: 0,
                    })
                }

                Player.updateElo(id, elos[id]!)
                await Player.updateOne(
                    { _id: id },
                    updates.map((v) => ({ $set: v })),
                    { upsert: true },
                )
            })
        }),
    )
}

function sendGameLog(game: Game, players: string[], teams: EmbedField[]) {
    const scorer = (game.scorer && client.users.cache.get(game.scorer)) || null
    const score = stringifyScore(game, game.scores![0]!, game.scores![1]!)
    const embed = new EmbedBuilder()
        .setColor(colors.baseColor)
        .setTitle(`Game #${game.sequence} Results`)
        .setDescription(`${score[0]!.toUpperCase()}${score.slice(1)}.`)
        .setFields(teams)
        .setFooter(scorer && { text: `Scored by ${scorer.username}` })
        .setTimestamp()

    const content = spoiler(players.map(userMention).join(" "))
    gameLog(game, { content, embeds: [embed] }).catch(console.error)
}

function sendQueueLog(game: Game, teams: EmbedField[]) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Game #${game.sequence}` })
        .setFooter({ text: `ID: ${game._id}` })
        .setColor(colors.baseColor)
        .setFields(teams)

    if (game.meta) {
        const seconds = Math.floor(game.meta.duration / 1000)
        embed
            .setTitle("Auto Scored")
            .setDescription(
                [
                    `- Map: ${game.meta.map}`,
                    `- Duration: ${Math.floor(seconds / 60)}:${`${seconds % 60}`.padStart(2, "0")}`,
                    `- Replay: ${game.meta.replay}`,
                ].join("\n"),
            )
    } else if (game.scorer) {
        embed
            .setTitle("Score Confirmed")
            .setDescription(`${userMention(game.scorer)} confirmed ${stringifyResult(game)}.`)
    } else {
        return
    }

    queueLog(game, { embeds: [embed] }).catch(console.error)
}

function getTeams(game: Game, oldElo: Record<string, number>, newElo: Record<string, number>) {
    const teams = game.winner === 1 ? [game.teams[1]!, game.teams[0]!] : game.teams
    return teams.map((team, i) => ({
        name: game.winner === -1 ? `Team ${i + 1}` : i === 0 ? "Winner" : "Loser",
        value: team.map((id) => `- ${userMention(id)} \`${oldElo[id]}\` **->** \`${newElo[id]}\``).join("\n"),
        inline: false,
    }))
}
