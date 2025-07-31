import { DocumentType, Prop } from "@typegoose/typegoose"
import { Types } from "mongoose"

import { SEASON } from "@/Constants"
import { Document, modelClass } from "../util/util"

export class GameMeta {
    @Prop({ type: Types.UUID, required: true })
    replay!: string

    @Prop({ type: Number, required: true })
    duration!: number

    @Prop({ type: String, required: true })
    map!: string
}

export class EloDiff {
    @Prop({ type: Types.Long, required: true })
    id!: string

    @Prop({ type: Number, required: true })
    old!: number

    @Prop({ type: Number, required: true })
    new!: number
}

@Document("Game", "ranked_games")
class GameClass {
    @Prop({ type: Types.Long, required: true })
    _id!: string

    @Prop({ type: Number, required: true })
    sequence!: number

    @Prop({ type: String, required: true, default: SEASON })
    season!: string

    @Prop({ type: Date, required: true, default: () => new Date() })
    date!: Date

    @Prop({ type: Types.Long, required: false })
    guildId?: string

    @Prop({ type: Types.Long, required: false })
    queueId?: string

    @Prop({ type: [Types.Long], required: false })
    channels!: string[]

    @Prop({ type: [[Types.Long]], required: true })
    teams!: string[][]

    @Prop({ type: [Number], required: false, default: undefined })
    scores?: number[]

    @Prop({ type: [EloDiff], required: false, default: undefined, _id: false })
    elo?: EloDiff[]

    @Prop({ type: Number, required: false })
    winner?: number

    @Prop({ type: Types.Long, required: false })
    scorer?: string

    @Prop({ type: GameMeta, required: false, _id: false })
    meta?: GameMeta
}

export const Game = modelClass(GameClass)
export type Game = DocumentType<GameClass>
