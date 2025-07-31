import { Player } from "@/database"

export abstract class QueueParticipant {
    protected skips = 0

    getSkips() {
        return this.skips
    }

    skip() {
        this.skips++
    }

    abstract getPlayers(): string[]
    abstract getELO(): number
}

export class SoloQueueParticipant extends QueueParticipant {
    constructor(private userId: string) {
        super()
    }

    getPlayers(): string[] {
        return [this.userId]
    }

    getELO(): number {
        return Player.getRankedElo(this.userId)
    }
}

export class GroupQueueParticipant extends QueueParticipant {
    constructor(private users: string[]) {
        super()
    }

    getPlayers(): string[] {
        return this.users
    }

    getELO(): number {
        return this.users.map((v) => Player.getRankedElo(v)).reduce((a, b) => a + b, 0) / this.users.length
    }
}
