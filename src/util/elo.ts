const ELO_SCALE_FACTOR = 400

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
    static modifier?: number
    static getModifier() {
        return this.modifier
    }

    static setModifier(value: number) {
        this.modifier = value === 1 ? undefined : value
    }

    static calculateDuel(
        team1: string[],
        team2: string[],
        elos: Record<string, number>,
        games: Record<string, number>,
        result: Result,
    ) {
        const elo1 = this.getAverage(team1.map((v) => elos[v]!))
        const elo2 = this.getAverage(team2.map((v) => elos[v]!))

        const results = { ...elos }
        const calc = (elo1: number, elo2: number, team: string[], result: number) => {
            for (const id of team) {
                const kFactor = games[id]! > 15 ? 16 : 32
                results[id] = elos[id]! + this.calculateEloDiff(elo1, elo2, result, kFactor)
            }
        }

        const [r1, r2] = RESULT_VALUES[result]
        calc(elo1, elo2, team1, r1)
        calc(elo2, elo1, team2, r2)
        return results
    }

    static getAverage(team: number[]) {
        const max = Math.max(...team)
        team.splice(team.indexOf(max), 1)
        const mins = team.reduce((pv, cv) => pv + cv, 0) / team.length
        return max * 0.75 + mins * 0.25
    }

    static getExpectedResult(elo1: number, elo2: number): number {
        return 1 / (1 + Math.pow(10, (elo2 - elo1) / ELO_SCALE_FACTOR))
    }

    static calculateEloDiff(elo1: number, elo2: number, result: number, kFactor: number) {
        const expectedResult = this.getExpectedResult(elo1, elo2)
        return Math.round(kFactor * (result - expectedResult) * (this.modifier ?? 1))
    }
}
