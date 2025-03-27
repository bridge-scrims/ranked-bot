import { Queue } from "@/database"
import { removeParticipantFromQueue } from "."
import { DEFAULT_RANGE } from ".."
import { startGame } from "../game/startGame"
import { addCooldown } from "./cooldown"
import { QueueParticipant } from "./participant"

interface QueueEntry {
    id: string
    skips: number
    elo: number
    player_count: number
    matched?: boolean
}

export function pollQueue(queue: Queue, participants: Map<string, QueueParticipant>) {
    const PLAYERS_PER_TEAM = 1;

    if (count(Array.from(participants.values())) < 2*PLAYERS_PER_TEAM) return 0
    
    const entries = Array.from(participants.entries())
        .map(([id, p]): QueueEntry => ({ id, skips: p.getSkips(), elo: p.getELO(), player_count: p.getPlayerIDs().length }))
        .sort((a, b) => a.elo - b.elo)

    let games = 0
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].matched) continue
        const team1 = [entries[i]]

        let z = i
        while (team1.reduce((sum, participant) => sum + participant.player_count, 0) < PLAYERS_PER_TEAM) {
            z++
            if (entries[z].matched) continue
            team1.push(entries[z])
        }

        if (team1.reduce((sum, participant) => sum + participant.player_count, 0) != PLAYERS_PER_TEAM) continue

        z++
        if (entries[z].matched) continue
        const team2 = [entries[z]]

        while (team2.reduce((sum, participant) => sum + participant.player_count, 0) < PLAYERS_PER_TEAM) {
            z++
            if (entries[z].matched) continue
            team2.push(entries[z])
        }

        if (team2.reduce((sum, participant) => sum + participant.player_count, 0) != PLAYERS_PER_TEAM) continue

        for (const t of [team1, team2]) {
            for (const v of t) {
                removeParticipantFromQueue(v.id)
                v.matched = true
                addCooldown(v.id)
            }
        }

        games++
        startGame(queue, [team1.map((qe) => {
            const playerIds = participants.get(qe.id)?.getPlayerIDs();
            if (playerIds) {
              return playerIds;
            }
            return [];}).flat(),

            team2.map((qe) => {
                const playerIds = participants.get(qe.id)?.getPlayerIDs();
                if (playerIds) {
                  return playerIds;
                }
                return [];}).flat()
          ]).catch(console.error)
    }

    return games
}

function count(participants: QueueParticipant[]): number {
    return participants.reduce((sum, participant) => sum + participant.getPlayerIDs().length, 0);
}
