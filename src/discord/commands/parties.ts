import { Player } from "@/database"
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
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),

    async execute(interaction: ChatInputCommandInteraction<undefined>) {
        switch (interaction.options.getSubcommand()) {
            case "create":
            case "invite": {
                if (!Player.getMcUuid(interaction.user.id))
                    throw new UserError("You must register using `/register` before you can create a party.")

                const players = [interaction.options.getUser("user")]
                    .filter((user) => user !== null)
                    .map((user) => user)

                if (players.some((p) => p === interaction.user))
                    throw new UserError("You can't invite yourself to a party.")

                if (players.some((p) => !Player.getMcUuid(p.id)))
                    throw new UserError(
                        "Players must be registered using `/register` before they can be invited.",
                    )

                if (!(await createParty(interaction.user, ...players)))
                    throw new UserError("Only the party leader can invite other players.")

                if (players.length === 0) return "Successfully created a party."
                return `Successfully invited ${players.map((player) => player.username).join(", ")}.`
            }
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
        .addUserOption(buildUserOption())
}

function buildUserOption() {
    return new SlashCommandUserOption()
        .setName(`user`)
        .setDescription(`The user to invite to the party.`)
        .setRequired(false)
}
