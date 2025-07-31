import { DocumentType, Prop } from "@typegoose/typegoose"
import { Types } from "mongoose"
import { Document, modelClass } from "../util/util"

@Document("Strike", "ranked_strikes")
export class StrikeClass {
    @Prop({ type: Types.Long, required: true })
    userId!: string

    @Prop({ type: String, required: true })
    season!: string

    @Prop({ type: Types.Long, required: true })
    executorId!: string

    @Prop({ type: Date, required: true, default: Date.now })
    givenAt!: Date

    @Prop({ type: String, required: false })
    reason?: string
}

export const Strike = modelClass(StrikeClass)
export type Strike = DocumentType<StrikeClass>
