import { randomUUIDv7 } from "bun"
import { LEADER_ALREADY_IN_PARTY, NO_PARTY_FOUND, NOT_IN_A_PARTY } from "./constants"
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
        return 0
    }

    export async function inviteUser(party: Party, user: User) {
        await user.send("Hi, <@" + party.leader.id + "> invited you to join their party!")
        return 0
    }

    export function leaveParty(user: User) {
        const party_id = playerParties.get(user.id)
        if (party_id == undefined) {
            return NOT_IN_A_PARTY
        }

        playerParties.delete(user.id)

        const party = parties.get(party_id)
        if (party == undefined) {
            return NO_PARTY_FOUND
        }

        party.removeMember(user.id)
        return 0
    }
}

class Party {
    id: string;
    leader: User;
    members: User[];

    constructor(leader: User, ...members: User[]) {
        this.id = randomUUIDv7()
        this.leader = leader
        this.members = members
    }

    removeMember(member: string) {
        this.members = this.members.filter(m => m.id !== member)
    }
}