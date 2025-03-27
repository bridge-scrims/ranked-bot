import { EmbedBuilder, InteractionReplyOptions } from "discord.js"
import { MessageOptionsBuilder } from "./MessageOptionsBuilder"

export class UserError extends Error {
    protected payload: InteractionReplyOptions

    constructor(title: string, description?: string) {
        super(description ?? title)
        this.payload = new MessageOptionsBuilder().setEphemeral(true).addEmbeds(
            new EmbedBuilder()
                .setColor("#DC0023")
                .setTitle(description ? title : null)
                .setDescription(this.message),
        )
    }

    toMessage() {
        return this.payload
    }
}
