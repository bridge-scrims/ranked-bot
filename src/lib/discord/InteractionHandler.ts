import {
    ApplicationIntegrationType,
    DiscordAPIError,
    EmbedBuilder,
    Events,
    InteractionContextType,
    type ApplicationCommandManager,
    type AutocompleteInteraction,
    type BaseMessageOptions,
    type Client,
    type ContextMenuCommandBuilder,
    type Interaction,
    type MessageComponentInteraction,
    type SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder,
} from "discord.js"

import { RequestError } from "@/util/request"
import { UserError } from "./UserError"

const IGNORE_CODES = new Set(["10062", "10008", "10003"])
const GUILD_COMMANDS = process.env["USE_GUILD_COMMANDS"]?.toLowerCase() === "true"

export class InteractionHandler {
    private builders: Record<string, CommandBuilder> = {}
    private commands: Record<string, (interaction: any) => Promise<unknown>> = {}
    private autocomplete: Record<string, (interaction: AutocompleteInteraction) => Promise<unknown>> = {}
    private components: Record<string, (interaction: MessageComponentInteraction) => Promise<unknown>> = {}

    constructor(client: Client) {
        client.on(Events.ClientReady, async (client) => {
            await this.register(client)
            client.on(Events.InteractionCreate, (i) => this.handle(i))
            console.log("[InteractionHandler] Commands registered. Now accepting interactions.")
        })
    }

    private async handle(interaction: Interaction) {
        try {
            const response = await this.handleNow(interaction)
            if (typeof response === "string")
                await this.respond(interaction, {
                    embeds: [new EmbedBuilder().setColor(0x5ca3f5).setDescription(response)],
                })
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORE_CODES.has(`${error.code}`)) return

            let userError: UserError
            if (error instanceof UserError) {
                userError = error
            } else if (error instanceof RequestError) {
                console.error(error)
                userError = new UserError(
                    "An external service this function depends on is currently unavailable.",
                )
            } else {
                console.error(`Unknown error handling interaction`, error)
                userError = new UserError("Unexpected error handling your commands.")
            }

            await this.respond(interaction, userError.toMessage()).catch(console.error)
        }
    }

    private async handleNow(interaction: Interaction) {
        if (interaction.isAutocomplete()) {
            return this.autocomplete[interaction.commandName]?.(interaction)
        } else if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            return this.commands[interaction.commandName]?.(interaction)
        } else if (interaction.isMessageComponent()) {
            interaction.args = interaction.customId.split(":")
            return this.components[interaction.args.shift()!]?.(interaction)
        }
    }

    private async respond(interaction: Interaction, response: BaseMessageOptions) {
        if (interaction.isRepliable()) {
            if (interaction.replied || interaction.deferred) await interaction.editReply(response)
            else await interaction.reply({ ...response, ephemeral: true })
        }
    }

    addCommands(...commands: Command[]) {
        for (const command of commands) {
            if (GUILD_COMMANDS) {
                command.builder.setContexts(InteractionContextType.Guild)
                command.builder.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            }

            if (!command.builder.contexts) command.builder.setContexts(InteractionContextType.Guild)
            if (!command.builder.integration_types)
                command.builder.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)

            const name = command.builder.name
            this.builders[name] = command.builder
            this.commands[name] = command.execute
            if (command.autocomplete) {
                this.autocomplete[name] = command.autocomplete
            }
        }
    }

    addComponents(components: Component[]) {
        for (const component of components) {
            this.components[component.id] = component.execute
        }
    }

    getRegistered() {
        return Object.keys(this.builders).concat(Object.keys(this.components))
    }

    private async register(client: Client<true>) {
        if (GUILD_COMMANDS) {
            console.log("[InteractionHandler] Using guild commands.")
            await Promise.all(client.guilds.cache.map((guild) => this.postCommands(guild.commands)))
        } else {
            await this.postCommands(client.application.commands)
        }
    }

    private async postCommands(manager: ApplicationCommandManager<unknown, unknown, unknown>) {
        await manager.set(Object.values(this.builders))
    }
}

type CommandBuilder = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | ContextMenuCommandBuilder
export interface Command {
    builder: CommandBuilder
    execute: (interaction: any) => Promise<unknown>
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>
}

export interface Component {
    id: string
    execute: (interaction: MessageComponentInteraction) => Promise<unknown>
}

declare module "discord.js" {
    interface MessageComponentInteraction {
        args: string[]
    }
}
