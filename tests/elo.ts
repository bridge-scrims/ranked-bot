import { Elo, Result } from "@/util/elo"

console.log(Elo.calculateDuel(["A", "B"], ["C", "D"], { A: 987, B: 1076, C: 1019, D: 1019 }, Result.Team1Win))
