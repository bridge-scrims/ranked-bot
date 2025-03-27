import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SnowflakeUtil, User } from "discord.js"

export function createParty(leader: User, ...users: User[]) {
    const party = playerParties.get(leader.id) ?? new Party(leader)
    if (party.leader === leader) return false

    users.forEach((user) => party.addInvite(user))
    return true
}

export function leaveParty(user: User) {
    const party = playerParties.get(user.id)
    if (!party) return false

    party.removeMember(user)
    return true
}

export function joinParty(user: User, partyId: string) {
    const existing = playerParties.get(user.id)
    if (existing) existing.removeMember(user)

    const party = parties.get(partyId)
    return party?.addMember(user) ? party : null
}

export function getParty(user: User) {
    return getPartyByUserID(user.id)
}

export function getPartyByUserID(user: string) {
    return playerParties.get(user)
}

const playerParties = new Map<string, Party>()
const parties = new Map<string, Party>()

class Party {
    id: string
    leader: User
    private members: Set<User>
    private invites: Set<string>

    constructor(leader: User) {
        this.id = SnowflakeUtil.generate().toString()
        this.leader = leader
        this.members = new Set()
        this.invites = new Set()
        this.addMember0(leader)

        parties.set(this.id, this)
    }

    send(message: string) {
        this.members.forEach((m) => m.send(message).catch(() => null))
    }

    addInvite(user: User) {
        if (this.invites.has(user.id)) return false

        this.invites.add(user.id)
        user.send({
            content: `Hi, ${this.leader} invited you to join their party!`,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`PARTY:join:${this.id}`)
                        .setLabel("Accept")
                        .setStyle(ButtonStyle.Success),
                ),
            ],
        }).catch(() => null)

        return true
    }

    addMember(user: User) {
        if (!this.invites.delete(user.id)) return false

        this.send(`${user} has joined the party.`)
        this.addMember0(user)
        return true
    }

    private addMember0(user: User) {
        this.members.add(user)
        playerParties.set(user.id, this)
    }

    disband() {
        this.send("Your party has been disbanded.")
        this.members.forEach((m) => this.removeMember0(m))
        parties.delete(this.id)
    }

    removeMember(user: User) {
        this.send(`${user} has left the party.`)

        if (user === this.leader) this.disband()
        else this.removeMember0(user)
    }

    private removeMember0(user: User) {
        this.members.delete(user)
        playerParties.delete(user.id)
    }

    getMembers(): string[] {
        return Array.from(this.members).map(user => user.id);
    }
    
}

process.on("SIGINT", () => parties.values().forEach((p) => p.disband()))