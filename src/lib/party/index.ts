import { Queue } from "@/database"
import { client } from "@/discord"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SnowflakeUtil, User } from "discord.js"
import { UserError } from "../discord/UserError"

const initialized = Promise.withResolvers()
const listeners: ((party: Party) => unknown)[] = []
const playerParties = new Map<string, Party>()
const parties = new Map<string, Party>()

export class Party {
    static async get(userId: string) {
        await initialized.promise
        return playerParties.get(userId)
    }

    static async create(leader: User) {
        const existingParty = await this.get(leader.id)
        if (!existingParty) return this.create0(leader)

        if (!existingParty.isLeader(leader.id))
            throw new UserError("Only the party leader can invite other players.")

        return existingParty
    }

    private static create0(leader: User) {
        const party = new Party(SnowflakeUtil.generate().toString(), leader, getRandomColor())
        party.addMember0(leader)
        party.send(`Party Created`, "The party has been created.", leader)
        return party
    }

    static join(user: User, partyId: string) {
        const party = parties.get(partyId)
        if (!party) throw new UserError("This party no longer exists.")

        party.addMember(user)
        return party
    }

    static async leave(user: User) {
        const party = await this.get(user.id)
        if (!party) throw new UserError("You aren't in a party.")

        party.removeMember(user)
        return party
    }

    static async kick(user: User, leader: User) {
        if (user.id === leader.id) throw new UserError("You can't kick yourself.")

        const party = await this.get(leader.id)
        if (!party) throw new UserError("You aren't in a party.")
        if (!party.isLeader(leader.id)) throw new UserError("Only the party leader can kick players.")
        if (!party.isMember(user)) throw new UserError("This player isn't in your party.")

        party.removeMember(user)
        return party
    }

    static onUpdate(callback: (party: Party) => unknown) {
        listeners.push(callback)
    }

    readonly members = new Set<User>()
    readonly invites = new Set<string>()

    constructor(
        readonly id: string,
        readonly leader: User,
        readonly color: number,
        members?: User[],
        invites?: string[],
    ) {
        invites?.forEach((invite) => this.invites.add(invite))
        if (members) {
            for (const member of members) {
                this.members.add(member)
                playerParties.set(member.id, this)
            }
        }

        parties.set(this.id, this)
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
        for (const guild of client.guilds.cache.values()) {
            const voice = guild.voiceStates.cache.get(user.id)
            if (voice?.channelId && Queue.cache.get(voice.channelId)) {
                voice.disconnect().catch(() => null)
            }
        }

        this.updated()
    }

    getMembers(): string[] {
        return Array.from(this.members).map((user) => user.id)
    }

    isMember(user: User) {
        return this.members.has(user)
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
            .setColor(this.color)

        if (author) embed.setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
        return embed
    }

    private updated() {
        listeners.forEach((call) => {
            try {
                call(this)
            } catch (e) {
                console.error(e)
            }
        })
    }
}

function getRandomColor() {
    return Math.floor(Math.random() * 0xaaaaaa) + 0x222222
}

const PARTY_FILE = Bun.file("./data/parties.json")

Promise.all([new Promise((res) => client.once("ready", res)), PARTY_FILE.json()])
    .then(([, data]) =>
        Promise.all(
            (data as PartyData[]).map(async (party) => {
                const members = await Promise.all(party.members.map((v) => client.users.fetch(v)))
                return new Party(party.id, members[0]!, party.color, members, party.invites)
            }),
        ),
    )
    .catch(console.error)
    .finally(() => initialized.resolve())

process.on("SIGINT", async () => {
    await initialized.promise
    await Bun.write(
        PARTY_FILE,
        JSON.stringify(
            Array.from(parties.values()).map(
                (party): PartyData => ({
                    id: party.id,
                    color: party.color,
                    members: party.getMembers(),
                    invites: Array.from(party.invites),
                }),
            ),
        ),
    )
})

interface PartyData {
    id: string
    color: number
    members: string[]
    invites: string[]
}
