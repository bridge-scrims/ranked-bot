import { Elo, Result } from "@/util/elo"

console.log(
    Elo.calculateDuel(
        ["A", "B"],
        ["C", "D"],
        { A: 1057, B: 1394, C: 1184, D: 949 },
        { A: 1, B: 30, C: 1, D: 1 },
        Result.Team1Win,
    ),
)
