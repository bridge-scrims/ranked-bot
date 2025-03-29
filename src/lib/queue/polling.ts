import { Queue } from "@/database"
import { removeParticipantFromQueue } from "."
import { DEFAULT_RANGE } from ".."
import { startGame } from "../game/startGame"
import { addCooldown } from "./cooldown"
import { QueueParticipant } from "./participant"

export interface QueueEntry {
    id: string
    idx?: number
    skips: number
    elo: number
    players: string[]
    matched?: boolean
}

export function* closestEntries(entries: QueueEntry[], entry: QueueEntry, range: number) {
    range += range * entry.skips

    let a, b, aRange, bRange, aDiff, bDiff
    let aIdx = entry.idx!
    let bIdx = entry.idx!

    while (true) {
        a = entries[--aIdx]
        b = entries[++bIdx]

        if (a === undefined && b === undefined) {
            break // No more entries to check
        }

        aRange = a === undefined || a.matched ? undefined : (aDiff = Math.abs(a.elo - entry.elo)) <= range
        bRange = b === undefined || b.matched ? undefined : (bDiff = Math.abs(b.elo - entry.elo)) <= range

        // Yield entries in order of smallest difference
        if (aRange && bRange) {
            // @ts-expect-error - If aRange and bRange are both true, then aDiff and bDiff are defined
            if (bDiff < aDiff) {
                yield b
                yield a
            } else {
                yield a
                yield b
            }
        } else if (aRange) {
            yield a
        } else if (bRange) {
            yield b
        } else if (aRange === false && bRange === false) {
            break // Both entries are out of range
        }
    }
}

interface Team {
    entries: QueueEntry[]
    players: number
    elo: number
    full?: boolean
}

export function makeTeams(entry: QueueEntry, entries: QueueEntry[], teamSize: number) {
    const team1: Team = {
        entries: [entry],
        players: entry.players.length,
        elo: entry.elo,
        full: entry.players.length === teamSize,
    }
    const team2: Team = { entries: [], players: 0, elo: 0 }
    const teams = [team2, team1]

    // Iterate over entries closest to elo of entry and put together teams
    for (const match of closestEntries(entries, entry, DEFAULT_RANGE)) {
        if (match.elo < entry.elo) {
            // If this is a match from the left side (smaller side) try to give it to team with largest elo
            teams.sort((a, b) => b.elo - a.elo)
        } else if (match.elo !== entry.elo) {
            // If this is a match from the right side (greater side) try to give it to team with smallest elo
            teams.sort((a, b) => a.elo - b.elo)
        }

        for (const team of teams) {
            if (team.full) continue

            const newPlayers = team.players + match.players.length
            if (newPlayers <= teamSize) {
                team.entries.push(match)
                team.players = newPlayers
                team.elo += match.elo
                team.full = newPlayers === teamSize
                if (teams.every((v) => v.full)) {
                    return teams
                }

                break
            }
        }
    }
}

export function pollQueue(queue: Queue, participants: Map<string, QueueParticipant>) {
    const entries = Array.from(participants.entries()).map(
        ([id, p]): QueueEntry => ({ id, skips: p.getSkips(), elo: p.getELO(), players: p.getPlayers() }),
    )

    const sorted = entries.toSorted((a, b) => a.elo - b.elo)
    sorted.forEach((v, i) => (v.idx = i))

    let games = 0

    // Iterate in order people joined the queue
    for (const entry of entries) {
        if (entry.matched) continue

        const teams = makeTeams(entry, entries, queue.teamSize)
        if (!teams) continue

        for (const team of teams) {
            for (const v of team.entries) {
                v.matched = true
                removeParticipantFromQueue(v.id)
                addCooldown(v.id)
            }
        }

        games++
        const players = teams.map((v) => v.entries.flatMap((v) => v.players))
        startGame(queue, players).catch(console.error)
    }

    return games
}
