const ELO_SCALE_FACTOR = 400
const K_FACTOR = 32

export enum Result {
    Team1Win,
    Team2Win,
    Draw,
}

const RESULT_VALUES = {
    [Result.Team1Win]: [1, 0],
    [Result.Team2Win]: [0, 1],
    [Result.Draw]: [0.5, 0.5],
}

export class Elo {
    static calculateDuel(team1: string[], team2: string[], elos: Record<string, number>, result: Result) {
        const results = { ...elos }
        const calc = (team1: string[], team2: string[], result: number) => {
            const opponent = this.getAverage(team2.map((v) => elos[v]!))
            for (const id of team1) {
                results[id] = this.calculateElo(elos[id]!, opponent, result)
            }
        }

        const [r1, r2] = RESULT_VALUES[result]
        calc(team1, team2, r1)
        calc(team2, team1, r2)
        return results
    }

    static getAverage(team: number[]) {
        return team.reduce((pv, cv) => pv + cv, 0)
    }

    static getExpectedResult(elo1: number, elo2: number): number {
        return 1 / (1 + Math.pow(10, (elo2 - elo1) / ELO_SCALE_FACTOR))
    }

    static calculateElo(elo1: number, elo2: number, result: number): number {
        const expectedResult = this.getExpectedResult(elo1, elo2)
        return Math.round(elo1 + K_FACTOR * (result - expectedResult))
    }
}
