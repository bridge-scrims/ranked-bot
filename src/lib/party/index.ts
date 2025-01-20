import { randomUUIDv7 } from "bun"
import { LEADER_ALREADY_IN_PARTY } from "./constants"
import { client } from "@/discord"
import { User } from "discord.js"

export namespace PartyHandler {
    const playerParties = new Map<string, string>()
    const parties = new Map<string, Party>()

    export async function createParty(leader: User, ...users: User[]) {
        if (playerParties.get(leader.id) != undefined) {
            return LEADER_ALREADY_IN_PARTY
        }

        const party = new Party(leader)
        parties.set(party.id, party)

        playerParties.set(leader.id, party.id)

        for (const user of users) {
            await inviteUser(party, user)
        }
    }

    export async function inviteUser(party: Party, user: User) {
        await user.send("Hi, <@" + party.leader.id + "> invited you to join their party!")
    }
}

class Party {
    id: string;
    leader: User;

    constructor(leader: User) {
        this.id = randomUUIDv7()
        this.leader = leader
    }
}