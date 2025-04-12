const DEFAULT_RANGE = 15

export interface QueueEntry {
    id: string
    skips: number
    elo: number
    players: string[]
    matched?: boolean
}

export class Team {
    elo: number
    skips: number
    idx?: number

    constructor(readonly entries: QueueEntry[]) {
        this.elo = entries.reduce((pv, cv) => pv + cv.elo, 0) / entries.length
        this.skips = Math.max(...entries.map((v) => v.skips))
    }

    get id() {
        return this.entries.map((entry) => entry.id).join(" | ")
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
        const entry = entries[idx]!
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

// TODO allow for more than one opponent
export function matchTeams(base: Team, entries: Team[]) {
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

// TODO support all team sizes and combining more than two entries
export function makeTeams(teamSize: number, entries: QueueEntry[], index?: Record<string, Team[]>) {
    const teams: Team[] = []
    function team(team: Team) {
        if (index) {
            for (const entry of team.entries) {
                if (!index[entry.id]?.push(team)) {
                    index[entry.id] = [team]
                }
            }
        }

        teams.push(team)
    }

    const odd = []

    for (const entry of entries) {
        if (entry.players.length === teamSize) {
            team(new Team([entry]))
        } else if (entry.players.length === teamSize / 2) {
            odd.push(entry)
        }
    }

    for (let i = 0; i < odd.length; i++) {
        for (let j = i + 1; j < odd.length; j++) {
            team(new Team([odd[i]!, odd[j]!]))
        }
    }

    teams.sort((a, b) => a.elo - b.elo)
    teams.forEach((v, i) => (v.idx = i))
    return teams
}

export function* matches(entries: QueueEntry[], teams: Team[], teamsIndex: Record<string, Team[]>) {
    // Iterate in order people joined the queue
    for (const entry of entries) {
        if (entry.matched || !(entry.id in teamsIndex)) continue

        for (const team of teamsIndex[entry.id]!) {
            if (team.reserved()) continue

            const match = matchTeams(team, teams)
            if (match) {
                yield match
                break
            }
        }
    }
}
