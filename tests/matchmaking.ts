import { closestEntries, makeTeams, matches, QueueEntry, Team } from "@/lib/matchmaking"

const SKIPS = Infinity
const RANGE = Infinity
const TEAM_SIZE = 2

const entries: QueueEntry[] = [
    { id: "A", players: ["1"], elo: 1000, skips: SKIPS },
    { id: "B", players: ["2"], elo: 1100, skips: SKIPS },
    { id: "C", players: ["3"], elo: 1200, skips: SKIPS },
    { id: "D", players: ["4"], elo: 900, skips: SKIPS },
    { id: "E", players: ["5"], elo: 800, skips: SKIPS },
    { id: "F", players: ["6"], elo: 1100, skips: SKIPS },
    { id: "G", players: ["7"], elo: 1200, skips: SKIPS },
    { id: "H", players: ["8"], elo: 900, skips: SKIPS },
    { id: "I", players: ["9", "12"], elo: 800, skips: SKIPS },
    { id: "J", players: ["10", "11"], elo: 1000, skips: SKIPS },
]

const teamsIndex: Record<string, Team[]> = {}
const teams = makeTeams(TEAM_SIZE, entries, teamsIndex)
console.log(
    "Teams: ",
    teams.map((v) => `${v.id} (ELO: ${v.elo})`),
)

for (const team of teams) {
    const cancel = team.reserve()
    console.log(
        `\nClosest to ${team.id} (ELO: ${team.elo}):`,
        closestEntries(teams, team, RANGE)
            .toArray()
            .map(({ entry }) => `${entry.id} (ELO: ${entry.elo})`),
    )
    cancel()
}

console.log("\n=== MATCHES ===")
for (const match of matches(entries, teams, teamsIndex)) {
    console.log(
        `Matched: `,
        match.map((t) => `${t.id} (ELO: ${t.elo})`),
    )
}

process.exit(0)
