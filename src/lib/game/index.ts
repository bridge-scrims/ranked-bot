import { SEASON } from "@/Constants"
import { Game } from "@/database/impl/models/Game"
import { client } from "@/discord"
import { Routes } from "discord.js"

let sequence: number
const newestGame = new Promise((res) =>
    Game.db.once("open", () =>
        Game.findOne({ season: SEASON }, { sequence: 1 }, { sort: { sequence: -1 } })
            .then((v) => (sequence = v?.sequence ?? 0))
            .then(res),
    ),
)

export async function incrementSequence() {
    await newestGame
    return ++sequence
}

const ongoingGames = new Promise<Map<string, Game>>((res) =>
    Game.db.once("open", () =>
        Game.find({ queueId: { $exists: true }, season: SEASON })
            .then((games) => new Map(games.map((v) => [v.id, v])))
            .then(res),
    ),
)

export async function getGame(id: string) {
    const games = await ongoingGames
    return games.get(id)
}

export async function createGame(data: Partial<Game>) {
    const games = await ongoingGames
    const game = await Game.create(data)
    games.set(game._id, game)
}

export async function archiveGame(game: Game) {
    const $set = {
        winner: game.winner,
        scores: game.scores,
        scorer: game.scorer,
        meta: game.meta,
        elo: game.elo,
    }

    const games = await ongoingGames
    const result = await Game.updateOne(
        { _id: game._id, queueId: { $exists: true } },
        {
            $unset: { queueId: "", guildId: "", channels: "" },
            $set,
        },
    )

    if (!result.matchedCount) return false

    games.delete(game._id)
    game.winner = $set.winner
    game.scores = $set.scores
    game.scorer = $set.scorer
    game.meta = $set.meta
    game.elo = $set.elo

    void Promise.allSettled(game.channels.map((id) => client.rest.delete(Routes.channel(id))))
    void Bun.sleep(1000).then(() => client.rest.delete(Routes.channel(game._id)).catch(() => null))

    return true
}
