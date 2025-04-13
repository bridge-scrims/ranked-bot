import { Player, Queue } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { Party } from "@/lib/party"

import {
    ChatInputCommandInteraction,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption,
} from "discord.js"

const teamChannels = new Set<string>()
function indexTeamChannels() {
    teamChannels.clear()
    for (const queue of Queue.cache.values()) {
        teamChannels.add(queue.teamsChannel)
    }
}

Queue.cache.on("add", () => indexTeamChannels())
Queue.cache.on("delete", () => indexTeamChannels())

export default {
    builder: new SlashCommandBuilder()
        .setName("party")
        .setDescription("All party related commands")
        .addSubcommand(buildCreateSubcommand("create", "Create a party and invite players"))
        .addSubcommand(buildCreateSubcommand("invite", "Invite players to your party", true))
        .addSubcommand((subcommand) => subcommand.setName("leave").setDescription("Leave a party"))
        .addSubcommand((subcommand) =>
            subcommand
                .setName("kick")
                .setDescription("Kick a player from your party")
                .addUserOption(buildUserOption(true, true)),
        )
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),

    async execute(interaction: ChatInputCommandInteraction<undefined>) {
        switch (interaction.options.getSubcommand()) {
            case "create":
            case "invite": {
                await Player.cacheInitialized()
                if (!Player.getMcUuid(interaction.user.id))
                    throw new UserError("You must register using `/register` before you can create a party.")

                const players = [interaction.options.getUser("user")].filter((player) => player !== null)

                if (players.some((p) => p === interaction.user))
                    throw new UserError("You can't invite yourself to a party.")

                if (players.some((p) => !Player.getMcUuid(p.id)))
                    throw new UserError(
                        "Players must be registered using `/register` before they can be invited.",
                    )

                await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                const party = await Party.create(interaction.user)

                const channel = teamChannels.has(interaction.channelId) ? interaction.channel! : undefined
                await party.addInvites(players, channel)

                if (players.length === 0) return "Successfully created a party."
                return `Successfully invited ${players.map((player) => player.username).join(", ")}.`
            }
            case "leave": {
                await Party.leave(interaction.user)
                return "Successfully left the party."
            }
            case "kick": {
                const user = interaction.options.getUser("user", true)
                await Party.kick(user, interaction.user)
                return `Successfully kicked ${user.username} from the party.`
            }
        }
    },
}

function buildCreateSubcommand(name: string, description: string, requiredToInvite = false) {
    return new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription(description)
        .addUserOption(buildUserOption(requiredToInvite))
}

function buildUserOption(required: boolean, kick = false) {
    return new SlashCommandUserOption()
        .setName(`user`)
        .setDescription(`The user to ${kick ? "kick from" : "invite to"} the party.`)
        .setRequired(required)
}
