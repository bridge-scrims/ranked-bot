import { randomUUIDv7 } from "bun"
import { LEADER_ALREADY_IN_PARTY, NO_PARTY_FOUND, NOT_IN_A_PARTY } from "./constants"
import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle, Events, Interaction, User } from "discord.js"
import { client } from "@/discord"
import { LeaderLeftReason, PartyDisbandReason } from "./disband_reasons"

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
        const row = createInviteView(party.id)

        await user.send({
            content: `Hi, <@${party.leader.id}> invited you to join their party!`,
            components: [row],
        });
        return 0;
    }

    export function leaveParty(user: User): number {
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

    export function disbandParty(party_id: string, reason: PartyDisbandReason): number {
        const party = parties.get(party_id)
        if (party == undefined) {
            return NO_PARTY_FOUND
        }

        party.disband = true

        party.members.forEach(leaveParty)
        leaveParty(party.leader)

        return 0
    }

    export async function handleInteraction(interaction: Interaction) {
        if (!interaction.isButton()) return;

        const customId = interaction.customId;
        if (customId.startsWith('accept_')) {
            const partyId = customId.replace('accept_', '');
            const party = parties.get(partyId);

            if (!party) {
                await interaction.reply({ content: 'This party no longer exists.', ephemeral: false });
                return;
            }

            const user = interaction.user;
            if (playerParties.has(user.id)) {
                await interaction.reply({ content: 'You are already in a party.', ephemeral: false });
                return;
            }

            playerParties.set(user.id, partyId);
            party.members.push(user);

            await interaction.reply({ content: 'You have successfully joined the party!', ephemeral: false });

            await interaction.message.edit({
                components: [createInviteView(partyId, true)],
            });
        }
    }

    function createInviteView(party_id: string, disabled: boolean = false): ActionRowBuilder<AnyComponentBuilder> {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_${party_id}`)
                .setLabel('Accept')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled)
        );
    }
}

class Party {
    id: string;
    leader: User;
    members: User[];
    disband: boolean = false

    constructor(leader: User, ...members: User[]) {
        this.id = randomUUIDv7()
        this.leader = leader
        this.members = members
    }

    removeMember(member: string) {
        if (member == this.leader.id) {
            if (this.disband) {
                return
            }
            PartyHandler.disbandParty(this.id, new LeaderLeftReason())
            return
        }
        this.members = this.members.filter(m => m.id !== member)
    }
}

client.on(Events.InteractionCreate, PartyHandler.handleInteraction)