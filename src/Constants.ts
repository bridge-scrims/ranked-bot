export const TEST = process.argv0.toLowerCase() === "TEST"
export const SEASON = process.env["SEASON"] ?? "test"
export const DEFAULT_ELO = 1000

export const Stats = {
    Elo: `ranked.${SEASON}.elo`,
    Wins: `ranked.${SEASON}.wins`,
    Losses: `ranked.${SEASON}.losses`,
    Draws: `ranked.${SEASON}.draws`,
    WinStreak: `ranked.${SEASON}.winStreak`,
    BestStreak: `ranked.${SEASON}.bestWinStreak`,
}
