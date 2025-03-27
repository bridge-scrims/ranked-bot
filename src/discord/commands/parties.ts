import { UserError } from "@/lib/discord/UserError"
import { createParty, leaveParty } from "@/lib/party"
import {
    ChatInputCommandInteraction,
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption,
} from "discord.js"

export default {
    builder: new SlashCommandBuilder()
        .setName("party")
        .setDescription("All party related commands")
        .addSubcommand(buildCreateSubcommand("create", "Create a party and invite players"))
        .addSubcommand(buildCreateSubcommand("invite", "Invite players to your party"))
        .addSubcommand((subcommand) => subcommand.setName("leave").setDescription("Leave a party"))
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case "create":
            case "invite":
                const players = [interaction.options.getUser("user1"), interaction.options.getUser("user2")]
                    .filter((user) => user !== null)
                    .map((user) => user)

                if (!createParty(interaction.user, ...players))
                    throw new UserError("Only the party leader can invite other players.")

                if (players.length === 0) return "Successfully created a party."
                return `Successfully invited ${players.map((player) => player.username).join(", ")}.`
            case "leave":
                if (!leaveParty(interaction.user)) {
                    throw new UserError("You aren't in a party!")
                }

                return "Successfully left the party."
        }
    },
}

function buildCreateSubcommand(name: string, description: string) {
    return new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription(description)
        .addUserOption(buildUserOption(1))
        .addUserOption(buildUserOption(2))
}

function buildUserOption(index: number) {
    return new SlashCommandUserOption()
        .setName(`user${index}`)
        .setDescription(`${index}. user to be invited`)
        .setRequired(false)
}
