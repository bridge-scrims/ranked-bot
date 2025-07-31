import { Queue } from "@/database"
import { removeParticipantFromQueue } from ".."
import { startGame } from "../../game/impl/startGame"
import { makeTeams, matches, QueueEntry, Team } from "../../matchmaking"
import { addCooldown } from "./cooldown"
import { QueueParticipant } from "./participant"

class ParticipantEntry implements QueueEntry {
    readonly skips: number
    readonly elo: number
    readonly players: string[]

    matched?: boolean
    idx?: number

    constructor(
        readonly id: string,
        readonly participant: QueueParticipant,
    ) {
        this.skips = participant.getSkips()
        this.elo = participant.getELO()
        this.players = participant.getPlayers()
    }
}

export function pollQueue(queue: Queue, participants: Map<string, QueueParticipant>) {
    const entries = Array.from(participants.entries()).map(([id, p]) => new ParticipantEntry(id, p))
    const teamsIndex: Record<string, Team[]> = {}
    const teams = makeTeams(queue.teamSize, entries, teamsIndex)
    if (teams.length < 2) return 0

    let games = 0
    for (const match of matches(entries, teams, teamsIndex)) {
        for (const team of match) {
            for (const v of team.entries) {
                removeParticipantFromQueue(v.id)
                addCooldown(v.id)
            }
        }

        games++
        const players = match.map((v) => v.entries.flatMap((v) => v.players))
        startGame(queue, players).catch(console.error)
    }

    for (const entry of entries) {
        if (!entry.matched) {
            entry.participant.skip()
        }
    }

    return games
}
