import { Player } from "@/database";

export interface QueueParticipant {
    getPlayerIDs(): string[];
    getELO(): number;
    getSkips(): number;
    skip(): void;
}

export class SingleUserQueueParticipant implements QueueParticipant {
    private userID: string;
    private skips: number;

    constructor(userID: string) {
        this.userID = userID;
        this.skips = 0;
    }

    getPlayerIDs(): string[] {
        return [this.userID];
    }

    getELO(): number {
        return Player.getRankedElo(this.userID);
    }

    getSkips(): number {
        return this.skips;
    }

    skip(): void {
        this.skips++;
    }
}

export class GroupQueueParticipant implements QueueParticipant {
    private userIDs: string[];
    private skips: number;

    constructor(userIDs: string[]) {
        this.userIDs = userIDs;
        this.skips = 0;
    }

    getPlayerIDs(): string[] {
        return this.userIDs;
    }

    getELO(): number {
        var totalElo = 0;
        for (const userID of this.userIDs) {
            totalElo += Player.getRankedElo(userID)
        }
        return totalElo / this.userIDs.length;
    }

    getSkips(): number {
        return this.skips;
    }

    skip(): void {
        this.skips++;
    }
}
