import { DocumentType, Prop } from "@typegoose/typegoose"
import { Types } from "mongoose"

import { SEASON } from "@/Constants"
import { Document, modelClass } from "../util"

export class Team {
    @Prop({ type: Types.Long, required: true })
    players!: string[]

    @Prop({ type: Number, required: false })
    score?: number
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

    @Prop({ type: Types.Long, required: false })
    channels?: string[]

    @Prop({ type: Number, required: false })
    winner?: number

    @Prop({ type: String, required: false })
    replay?: string

    @Prop({ type: Team, required: true })
    teams!: Team[]

    isParticipant(id: string) {
        return this.teams.some((v) => v.players.includes(id))
    }
}

export const Game = modelClass(GameClass)
export type Game = DocumentType<GameClass>
