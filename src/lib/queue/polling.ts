import { Queue } from "@/database"
import { removeParticipantFromQueue } from "."
import { DEFAULT_RANGE } from ".."
import { startGame } from "../game/startGame"
import { addCooldown } from "./cooldown"
import { QueueParticipant } from "./participant"

export interface QueueEntry {
    id: string
    skips: number
    elo: number
    players: string[]
    matched?: boolean
}

class Team {
    elo: number
    skips: number
    idx?: number

    constructor(readonly entries: QueueEntry[]) {
        this.elo = entries.reduce((pv, cv) => pv + cv.elo, 0) / entries.length
        this.skips = Math.max(...entries.map((v) => v.skips))
    }

    reserve() {
        const reserved = this.entries.filter((entry) => !entry.matched)
        reserved.forEach((entry) => (entry.matched = true))
        return () => reserved.forEach((entry) => (entry.matched = false))
    }

    reserved() {
        return this.entries.some((entry) => entry.matched)
    }
}

export function* closestEntries(entries: Team[], entry: Team, range: number) {
    range += range * entry.skips

    const left = entriesIterate(entries, entry, range, -1)
    const right = entriesIterate(entries, entry, range, 1)

    let a = left.next().value
    let b = right.next().value

    while (a && b) {
        if (b.diff < a.diff) {
            yield b
            b = right.next().value
            if (a.entry.reserved()) {
                a = left.next().value
            }
        } else {
            yield a
            a = left.next().value
            if (b.entry.reserved()) {
                b = right.next().value
            }
        }
    }

    if (a) {
        yield a
        yield* left
    } else if (b) {
        yield b
        yield* right
    }
}

function* entriesIterate(entries: Team[], base: Team, range: number, delta: number) {
    let idx = base.idx! + delta

    while (idx >= 0 && idx < entries.length) {
        const entry = entries[idx]
        if (!entry.reserved()) {
            const diff = Math.abs(entry.elo - base.elo)
            if (diff > range) {
                break
            }

            yield { entry, diff }
        }

        idx += delta
    }
}

export function makeTeams(base: Team, entries: Team[]) {
    const cancel = base.reserve()

    const iter = closestEntries(entries, base, DEFAULT_RANGE)
    const opponent = iter.next().value?.entry
    if (!opponent) {
        cancel()
        return
    }

    opponent.reserve()
    return [base, opponent]
}

class ParticipantEntry implements QueueEntry {
    readonly skips: number
    readonly elo: number
    readonly players: string[]

    matched?: boolean
    idx?: number

    constructor(
        readonly id: string,
        readonly participant: QueueParticipant,
    ) {
        this.skips = participant.getSkips()
        this.elo = participant.getELO()
        this.players = participant.getPlayers()
    }
}

export function pollQueue(queue: Queue, participants: Map<string, QueueParticipant>) {
    const entries = Array.from(participants.entries()).map(([id, p]) => new ParticipantEntry(id, p))

    // TODO support all team sizes and combining more than two entries
    const teamsIndex: Record<string, Team[]> = {}
    const teams: Team[] = []
    function team(team: Team) {
        for (const entry of team.entries) {
            if (!teamsIndex[entry.id]?.push(team)) {
                teamsIndex[entry.id] = [team]
            }
        }

        teams.push(team)
    }

    const odd = []

    for (const entry of entries) {
        if (entry.players.length === queue.teamSize) {
            team(new Team([entry]))
        } else if (entry.players.length === queue.teamSize / 2) {
            odd.push(entry)
        }
    }

    for (let i = 0; i < odd.length; i++) {
        for (let j = i + 1; j < odd.length; j++) {
            team(new Team([odd[i], odd[j]]))
        }
    }

    const sorted = teams.toSorted((a, b) => a.elo - b.elo)
    sorted.forEach((v, i) => (v.idx = i))

    let games = 0

    // Iterate in order people joined the queue
    for (const entry of entries) {
        if (entry.matched || !(entry.id in teamsIndex)) continue

        for (const team of teamsIndex[entry.id]) {
            const teams = makeTeams(team, sorted)
            if (!teams) continue

            for (const team of teams) {
                for (const v of team.entries) {
                    removeParticipantFromQueue(v.id)
                    addCooldown(v.id)
                }
            }

            games++
            const players = teams.map((v) => v.entries.flatMap((v) => v.players))
            startGame(queue, players).catch(console.error)
            break
        }
    }

    for (const entry of entries) {
        if (!entry.matched) {
            entry.participant.skip()
        }
    }

    return games
}
