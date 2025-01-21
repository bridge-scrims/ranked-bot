export interface PartyDisbandReason {
    getReasonMessage(): string
}

export class LeaderLeftReason implements PartyDisbandReason {
    getReasonMessage(): string {
        return "Leader left party!"
    }
}