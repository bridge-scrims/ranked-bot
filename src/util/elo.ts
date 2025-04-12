const ELO_SCALE_FACTOR = 400
const K_FACTOR = 32

export enum Result {
    Team1Win,
    Team2Win,
    Draw,
}

const RESULT_VALUES: Record<Result, [number, number]> = {
    [Result.Team1Win]: [1, 0],
    [Result.Team2Win]: [0, 1],
    [Result.Draw]: [0.5, 0.5],
}

export class Elo {
    static calculateDuel(team1: string[], team2: string[], elos: Record<string, number>, result: Result) {
        const elo1 = this.getAverage(team1.map((v) => elos[v]!))
        const elo2 = this.getAverage(team2.map((v) => elos[v]!))

        const results = { ...elos }
        const calc = (elo1: number, elo2: number, team: string[], result: number) => {
            const diff = this.calculateEloDiff(elo1, elo2, result)
            for (const id of team) {
                results[id] = elos[id]! + diff
            }
        }

        const [r1, r2] = RESULT_VALUES[result]
        calc(elo1, elo2, team1, r1)
        calc(elo2, elo1, team2, r2)
        return results
    }

    static getAverage(team: number[]) {
        return team.reduce((pv, cv) => pv + cv, 0) / team.length
    }

    static getExpectedResult(elo1: number, elo2: number): number {
        return 1 / (1 + Math.pow(10, (elo2 - elo1) / ELO_SCALE_FACTOR))
    }

    static calculateEloDiff(elo1: number, elo2: number, result: number): number {
        const expectedResult = this.getExpectedResult(elo1, elo2)
        return Math.round(K_FACTOR * (result - expectedResult))
    }
}
