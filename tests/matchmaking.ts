import { closestEntries, makeTeams, QueueEntry } from "@/lib/queue/polling"

const SKIPS = Infinity
const RANGE = Infinity

const unsorted: QueueEntry[] = [
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

const sorted = unsorted.toSorted((a, b) => a.elo - b.elo)
sorted.forEach((v, i) => (v.idx = i))

console.log(
    "Teams Sorted: ",
    sorted.map((v) => v.id),
)

for (const entry of unsorted) {
    console.log(
        `Closest to ${entry.id} (ELO: ${entry.elo}): ${closestEntries(sorted, entry, RANGE)
            .toArray()
            .map(({ entry }) => `${entry.id} (ELO: ${entry.elo})`)
            .join(" | ")}`,
    )
}

console.log("\n=== MATCHES ===")
const TEAM_SIZE = 2
for (const entry of unsorted) {
    if (entry.matched) continue

    const teams = makeTeams(entry, sorted)
    if (!teams) continue

    for (const team of teams) {
        for (const v of team.entries) {
            v.matched = true
        }
    }

    console.log(
        `Matched ${teams.map((v) => v.entries.map((v) => `${v.id} (ELO: ${v.elo})`).join(" | ")).join(" with ")}`,
    )
}

process.exit(0)
