import { EmbedBuilder, InteractionReplyOptions } from "discord.js"
import { MessageOptionsBuilder } from "./MessageOptionsBuilder"

export class UserError extends Error {
    protected payload: InteractionReplyOptions

    constructor(title: string, description?: string)
    constructor(resolvable: EmbedBuilder | InteractionReplyOptions)
    constructor(description: string)

    constructor(...args: any[]) {
        super(resolveMessage(...args))
        this.payload = resolvePayload(...args)
    }

    toMessage() {
        return this.payload
    }
}

function resolveMessage(...args: any[]) {
    if (args.length === 1) {
        if (args[0] instanceof EmbedBuilder) {
            return args[0].data.title || args[0].data.description
        } else if (typeof args[0] === "object") {
            return args[0].content
        }
    }
    return args[0] || args[1]
}

function buildPayload(title: string | null, description: string | null = null) {
    const embed = new EmbedBuilder().setColor("#DC0023").setTitle(title).setDescription(description)
    return new MessageOptionsBuilder().addEmbeds(embed).removeMentions().setEphemeral(true)
}

function resolvePayload(...args: any[]) {
    if (args.length === 1) {
        if (args[0] instanceof EmbedBuilder) {
            if (!args[0].data.color) args[0].setColor("#DC0023")
            return new MessageOptionsBuilder().addEmbeds(args[0]).removeMentions().setEphemeral(true)
        } else if (typeof args[0] === "string") {
            return buildPayload(null, args[0])
        }
        return args[0]
    }
    return buildPayload(args[0], args[1])
}
