import { SEASON } from "@/Constants"
import {
    Document,
    LongArrayProp,
    LongProp,
    Prop,
    getSchemaFromClass,
    modelSchema,
    type SchemaDocument,
} from "../util"

export class Team {
    @LongArrayProp({ required: true })
    players!: string[]

    @Prop({ type: Number, required: false })
    result?: number
}

@Document("Game", "ranked_games")
class Template {
    @LongProp({ required: true })
    _id!: string

    @Prop({ type: Number, required: true })
    sequence!: number

    @Prop({ type: String, required: true, default: SEASON })
    season!: string

    @Prop({ type: Date, required: true, default: () => new Date() })
    date!: Date

    @LongProp({ required: false })
    guildId?: string

    @LongProp({ required: false })
    queueId?: string

    @LongArrayProp({ required: false })
    channels?: string[]

    @Prop({ type: [getSchemaFromClass(Team)], required: true })
    teams!: Team[]

    isParticipant(id: string) {
        return this.teams.some((v) => v.players.includes(id))
    }
}

const schema = getSchemaFromClass(Template)
export const Game = modelSchema(schema, Template)
export type Game = SchemaDocument<typeof schema>
