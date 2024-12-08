import { RequestError } from "@/util/request"
import {
    ApplicationIntegrationType,
    DiscordAPIError,
    EmbedBuilder,
    Events,
    InteractionContextType,
    type ApplicationCommand,
    type AutocompleteInteraction,
    type BaseMessageOptions,
    type Client,
    type ContextMenuCommandBuilder,
    type Interaction,
    type MessageComponentInteraction,
    type SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder,
} from "discord.js"
import { UserError } from "./UserError"

const GUILD_COMMANDS = process.env["USE_GUILD_COMMANDS"]?.toLowerCase() === "true"

export class InteractionHandler {
    private client: Client
    private builders: Record<string, CommandBuilder> = {}
    private commands: Record<string, (interaction: any) => Promise<unknown>> = {}
    private autocomplete: Record<string, (interaction: AutocompleteInteraction) => Promise<unknown>> = {}
    private components: Record<string, (interaction: MessageComponentInteraction) => Promise<unknown>> = {}

    constructor(client: Client) {
        this.client = client
        client.on(Events.ClientReady, () => this.register())
        client.on(Events.InteractionCreate, async (interaction) => this.handle(interaction))

        if (GUILD_COMMANDS) {
            console.log("[CommandInstaller] Using guild commands.")
            client.on(Events.GuildCreate, (guild) => this.register0(guild.id))
        }
    }

    private get application() {
        return this.client.application!
    }

    private async handle(interaction: Interaction) {
        try {
            const response = await this.handleNow(interaction)
            if (typeof response === "string")
                await this.respond(interaction, {
                    embeds: [new EmbedBuilder().setColor(0x5ca3f5).setDescription(response)],
                })
        } catch (error) {
            if (error instanceof DiscordAPIError && [10062, 10008].includes(error.code as number)) return

            let userError: UserError
            if (!(error instanceof UserError)) {
                console.error(`Unknown error handling interaction`, error)
                userError = new UserError("Unexpected error handling your commands.")
            } else if (error instanceof RequestError) {
                console.error(error)
                userError = new UserError(
                    "An external service this function depends on is currently unavailable.",
                )
            } else {
                userError = error
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

    async register() {
        if (GUILD_COMMANDS) {
            this.application.commands.set([]).catch(console.error)
            await Promise.all(
                this.client.guilds.cache.map((guild) => this.register0(guild.id).catch(console.error)),
            )
        } else {
            this.register0().catch(console.error)
            for (const guild of this.client.guilds.cache.keys()) {
                this.application.commands.set([], guild).catch(console.error)
            }
        }
        console.log("[InteractionHandler] Commands registered.")
    }

    private async register0(guildId?: string) {
        const existing = await this.application.commands.fetch({ guildId })
        const existingNames = new Set<string>()
        const promises: Promise<unknown>[] = []

        for (const cmd of existing.values()) {
            existingNames.add(cmd.name)

            const builder = this.builders[cmd.name]
            if (!builder) {
                console.log("[InteractionHandler] Deleting " + cmd.name + " since it wasn't registered.")
                promises.push(cmd.delete().catch(console.error))
            } else if (!commandsEqual(cmd, builder)) {
                console.log("[InteractionHandler] Updating " + cmd.name + " to match the builder.")
                promises.push(this.application.commands.create(builder, guildId).catch(console.error))
            }
        }

        for (const [name, builder] of Object.entries(this.builders)) {
            if (!existingNames.has(name)) {
                console.log("[InteractionHandler] Creating " + name + " since it's new.")
                promises.push(this.application.commands.create(builder, guildId).catch(console.error))
            }
        }

        await Promise.all(promises)
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

function commandsEqual(command: ApplicationCommand, builder: CommandBuilder) {
    // @ts-expect-error important so that we can tell if the command changed or not
    builder.options?.filter((option) => !option.type).forEach((option) => (option.type = 1))
    // @ts-expect-error important so that we can tell if the command changed or not
    builder.nsfw = false

    // @ts-expect-error important so that we can tell if the command changed or not
    command.options.filter((o) => o.type === 1 && !o.options).map((o) => (o.options = []))
    command.dmPermission = null
    if (command.guildId) {
        command.contexts = [InteractionContextType.Guild]
        command.integrationTypes = [ApplicationIntegrationType.GuildInstall]
    }

    return command.equals(builder as any)
}
