import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SnowflakeUtil, User } from "discord.js"
import { UserError } from "../discord/UserError"

const listeners: ((party: Party) => unknown)[] = []
const playerParties = new Map<string, Party>()
const parties = new Map<string, Party>()

export class Party {
    static get(userId: string) {
        return playerParties.get(userId)
    }

    static create(leader: User) {
        const existingParty = this.get(leader.id)
        if (!existingParty) return new Party(leader)

        if (!existingParty.isLeader(leader.id))
            throw new UserError("Only the party leader can invite other players.")

        return existingParty
    }

    static join(user: User, partyId: string) {
        const party = parties.get(partyId)
        if (!party) throw new UserError("This party no longer exists.")

        party.addMember(user)
        return party
    }

    static leave(user: User) {
        const party = this.get(user.id)
        if (!party) throw new UserError("You aren't in a party.")

        party.removeMember(user)
        return party
    }

    static kick(user: User, leader: User) {
        if (user.id === leader.id) throw new UserError("You can't kick yourself.")

        const party = this.get(leader.id)
        if (!party) throw new UserError("You aren't in a party.")
        if (!party.isLeader(leader.id)) throw new UserError("Only the party leader can kick players.")
        if (!party.getMembers().includes(user.id)) throw new UserError("This player isn't in your party.")

        party.removeMember(user)
        return party
    }

    static onUpdate(callback: (party: Party) => unknown) {
        listeners.push(callback)
    }

    id: string
    leader: User
    private readonly partyColor: number
    private members: Set<User>
    private invites: Set<string>

    constructor(leader: User) {
        this.id = SnowflakeUtil.generate().toString()
        this.leader = leader
        this.partyColor = this.getRandomColor()
        this.members = new Set()
        this.invites = new Set()

        this.addMember0(leader)
        parties.set(this.id, this)

        this.send(`Party Created`, "The party has been created.", leader)
    }

    disband() {
        this.send("Party Disbanded", "The party has been disbanded.", this.leader)
        this.members.forEach((m) => this.removeMember0(m))
        parties.delete(this.id)
    }

    async addInvites(users: User[]) {
        const invites = users.filter((user) => !this.invites.has(user.id))
        if (invites.length === 0) return

        await Promise.all(invites.map((user) => this.addInvite(user)))
        const failedInvites = invites.filter((user) => !this.invites.has(user.id))
        if (failedInvites.length > 0) {
            throw new UserError(
                "Party Invite Failed",
                `Failed to invite ${failedInvites.map((player) => player.username).join(", ")}.`,
            )
        }
    }

    private async addInvite(user: User) {
        if (this.invites.has(user.id)) return

        const embed = this.getEmbed(
            "Party Invite",
            `${this.leader} has invited you to join their party.`,
            this.leader,
        )

        const message = await user
            .send({
                embeds: [embed],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`PARTY:join:${this.id}`)
                            .setLabel("Accept")
                            .setStyle(ButtonStyle.Success),
                    ),
                ],
            })
            .catch(() => null)

        if (!message) return

        this.invites.add(user.id)
        this.send(`Party Invite`, `${user} has been invited to the party.`, this.leader)
    }

    addMember(user: User) {
        if (!this.invites.delete(user.id)) return

        this.addMember0(user)
        this.send("Party Join", `${user} has joined the party.`, user)
    }

    private addMember0(user: User) {
        this.members.add(user)
        playerParties.set(user.id, this)
        this.updated()
    }

    removeMember(user: User) {
        this.send("Party Leave", `${user} has left the party.`, user)

        if (user === this.leader) this.disband()
        else this.removeMember0(user)
    }

    private removeMember0(user: User) {
        this.members.delete(user)
        playerParties.delete(user.id)
        this.updated()
    }

    getMembers(): string[] {
        return Array.from(this.members).map((user) => user.id)
    }

    isLeader(user: string) {
        return this.leader.id === user
    }

    send(title: string, description?: string, author?: User) {
        const embed = this.getEmbed(title, description, author)
        this.members.forEach((m) => m.send({ embeds: [embed] }).catch(() => null))
    }

    getEmbed(title: string, description?: string, author?: User) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description ?? null)
            .setColor(this.partyColor)

        if (author) embed.setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
        return embed
    }

    private updated() {
        listeners.forEach((call) => call(this))
    }

    private getRandomColor() {
        return Math.floor(Math.random() * 0xaaaaaa) + 0x222222
    }
}

process.on("SIGINT", () => parties.values().forEach((p) => p.disband()))
