import { Elo, Result } from "@/util/elo"

console.log(Elo.calculateDuel(["A", "B"], ["C", "D"], { A: 1600, B: 900, C: 1000, D: 1000 }, Result.Team1Win))
