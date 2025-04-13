import { DocumentType, Prop } from "@typegoose/typegoose"
import { channelLink } from "discord.js"
import { Types } from "mongoose"
import { Document, modelClassCached } from "../util"

@Document("Queue", "ranked_queues")
class QueueClass {
    @Prop({ type: Types.Long, required: true })
    _id!: string

    @Prop({ type: Types.Long, required: true })
    guildId!: string

    @Prop({ type: Types.Long, required: true })
    textCategory!: string

    @Prop({ type: Types.Long, required: true })
    vcCategory!: string

    @Prop({ type: Types.Long, required: true })
    teamsChannel!: string

    @Prop({ type: Types.Long, required: true })
    gameLog!: string

    @Prop({ type: Types.Long, required: true })
    queueLog!: string

    @Prop({ type: Number, required: true })
    teamSize!: number

    @Prop({ type: Types.Long, required: true })
    workerId!: string

    @Prop({ type: String, required: true })
    token!: string

    toString() {
        return channelLink(this._id, this.guildId)
    }
}

export const Queue = modelClassCached(QueueClass)
export type Queue = DocumentType<QueueClass>
