import { Player, Queue } from "@/database"
import { removeFromQueue } from "."
import { DEFAULT_RANGE } from ".."
import { startGame } from "../game/startGame"
import { addCooldown } from "./cooldown"

interface QueueEntry {
    id: string
    skips: number
    elo: number
    matched?: boolean
}

export function pollQueue(queue: Queue, players: Map<string, number>) {
    if (players.size < 2) return 0

    const entries = Array.from(players.entries())
        .map(([id, skips]): QueueEntry => ({ id, skips, elo: Player.getRankedElo(id) }))
        .sort((a, b) => a.elo - b.elo)

    function findClosestMatch(entry: QueueEntry, idx: number) {
        const range = DEFAULT_RANGE + entry.skips * 5
        for (let distance = 1; true; distance++) {
            const a = entries[idx - distance]
            const b = entries[idx + distance]
            if (a === undefined && b === undefined) return undefined

            const aDiff = a === undefined ? Infinity : Math.abs(a.elo - entry.elo)
            const bDiff = b === undefined ? Infinity : Math.abs(b.elo - entry.elo)

            if (a !== undefined && !a.matched && aDiff <= range && aDiff <= bDiff) return a
            if (b !== undefined && !b.matched && bDiff <= range) return b
        }
    }

    let games = 0
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        if (entry.matched) continue

        const match = findClosestMatch(entry, i)
        if (!match) {
            // Expand the range for this player
            players.set(entry.id, entry.skips + 1)
            continue
        }

        for (const v of [entry, match]) {
            removeFromQueue(v.id)
            v.matched = true
            addCooldown(v.id)
        }

        games++
        startGame(queue, [[entry.id], [match.id]]).catch(console.error)
    }

    return games
}
