import { SEASON } from "@/Constants"
import { Game } from "@/database/models/Game"
import { client } from "@/discord"
import { Routes } from "discord.js"

let sequence: number
const playerGames = new Map<string, Game>()

const newestGame = Game.find({ season: SEASON })
    .sort({ sequence: -1 })
    .findOne()
    .then((v) => (sequence = v?.sequence ?? 0))

const ongoingGames = Game.find({ queueId: { $exists: true }, season: SEASON }).then((games) => {
    games.forEach((game) => indexPlayers(game))
    return new Map(games.map((v) => [v.id, v]))
})

export async function incrementSequence() {
    await newestGame
    return ++sequence
}

function indexPlayers(game: Game) {
    game.teams.flatMap((v) => v.players).forEach((v) => playerGames.set(v, game))
}

export async function getGame(id: string) {
    const games = await ongoingGames
    return games.get(id)
}

export async function createGame(data: Partial<Game>) {
    const games = await ongoingGames
    const game = await Game.create(data)
    games.set(game.id, game)
    indexPlayers(game)
}

export async function archiveGame(game: Game, results: number[]) {
    const games = await ongoingGames
    const update = await Game.updateOne(
        { _id: game.id, queueId: { $exists: true } },
        {
            $unset: { queueId: "", guildId: "", channels: "" },
            $set: results.reduce((o, v, i) => ({ ...o, [`teams.${i}.result`]: v }), {}),
        },
    )

    if (!update.matchedCount) return false

    games.delete(game.id)
    game.teams.flatMap((v) => v.players.forEach((v) => playerGames.delete(v)))

    Promise.allSettled(game.channels!.concat(game._id)!.map((id) => client.rest.delete(Routes.channel(id))))
    return true
}

export function getMemberGame(user: string) {
    return playerGames.get(user)
}
