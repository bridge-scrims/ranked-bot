import {
    APIActionRowComponent,
    APIEmbed,
    APIMessageActionRowComponent,
    ActionRowBuilder,
    AllowedMentionsTypes,
    BaseMessageOptions,
    ButtonBuilder,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
    MessageMentionOptions,
} from "discord.js"

type BuilderOrBuildCall<T> = ((builder: T) => T) | T
function resolveBuilders<T>(Builder: new () => T, resolvables: BuilderOrBuildCall<T>[]) {
    return resolvables.map((v) => (v instanceof Function ? v(new Builder()) : v))
}

// content should be able to be null
const NULL = null as unknown as undefined

export class MessageOptionsBuilder {
    public content?: string
    public embeds: APIEmbed[]
    public components: APIActionRowComponent<APIMessageActionRowComponent>[]
    public allowedMentions: MessageMentionOptions
    public ephemeral?: boolean

    constructor({ content, embeds, components, allowedMentions }: BaseMessageOptions = {}) {
        this.content = content ?? NULL
        this.embeds = (embeds as APIEmbed[]) ?? []
        this.components = (components as APIActionRowComponent<APIMessageActionRowComponent>[]) ?? []
        this.allowedMentions = allowedMentions ?? {
            parse: [AllowedMentionsTypes.User, AllowedMentionsTypes.Role],
        }
    }

    setEphemeral(ephemeral: boolean) {
        this.ephemeral = ephemeral
        return this
    }

    setAllowedMentions(allowedMentions: MessageMentionOptions = {}) {
        this.allowedMentions = allowedMentions
        return this
    }

    removeMentions() {
        this.allowedMentions = { parse: [] }
        return this
    }

    setContent(content?: string | null) {
        this.content = content === null ? NULL : !content ? undefined : `${content}`
        if (this.content && this.content.length > 2000)
            throw new TypeError("Message content can't be longer than 2000!")
        return this
    }

    editContent(editor: (content: string) => string) {
        return this.setContent(editor(this.content ?? ""))
    }

    addEmbeds(...embeds: BuilderOrBuildCall<EmbedBuilder>[]) {
        this.embeds.push(...resolveBuilders(EmbedBuilder, embeds).map((v) => v.toJSON()))
        if (this.embeds.length > 10) throw new TypeError("You can't have more than 10 embeds!")
        return this
    }

    addActions(...actions: MessageActionRowComponentBuilder[]) {
        if (actions.length > 5) throw new TypeError("There can't be more than 5 components per action row!")
        return this.addComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(...actions),
        )
    }

    addButtons(...buttons: BuilderOrBuildCall<ButtonBuilder>[]) {
        if (buttons.length > 5) throw new TypeError("There can't be more than 5 buttons per action row!")
        return this.addComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                ...resolveBuilders(ButtonBuilder, buttons),
            ),
        )
    }

    addComponents(...components: ActionRowBuilder<MessageActionRowComponentBuilder>[]) {
        this.components.push(...components.map((v) => v.toJSON()))
        if (components.length > 5) throw new TypeError("There can't be more than 5 action rows!")
        return this
    }

    createMultipleEmbeds<T>(
        items: T[],
        getEmbedCall: (items: T[], index: number, groups: T[][]) => EmbedBuilder,
    ) {
        let groups: T[][] = Array.from({ length: Math.ceil(items.length / 25) })
        if (groups.length > 10) throw new TypeError("There can't be more than 10 embeds!")

        const groupSize = Math.floor(items.length / groups.length)
        groups = groups.map((_, i) =>
            items.slice(i * groupSize, i === groups.length - 1 ? items.length : (i + 1) * groupSize),
        )

        return this.addEmbeds(
            ...groups.map((items, idx, groups) => {
                const embed = getEmbedCall(items, idx, groups)
                if (!embed.data.footer && groups.length > 1)
                    embed.setFooter({ text: `Page ${idx + 1}/${groups.length}` })
                return embed
            }),
        )
    }
}
