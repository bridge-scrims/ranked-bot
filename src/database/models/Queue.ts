import {
    Document,
    LongProp,
    Prop,
    getSchemaFromClass,
    modelSchemaWithCache,
    type SchemaDocument,
} from "../util"

@Document("Queue", "ranked_queues")
class Template {
    @LongProp({ required: true })
    _id!: string

    @LongProp({ required: true })
    guildId!: string

    @LongProp({ required: true })
    textCategory!: string

    @LongProp({ required: true })
    vcCategory!: string

    @LongProp({ required: true })
    gameLog!: string

    @LongProp({ required: true })
    queueLog!: string

    @LongProp({ required: true })
    workerId!: string

    @Prop({ type: String, required: true })
    token!: string
}

const schema = getSchemaFromClass(Template)
export const Queue = modelSchemaWithCache(schema, Template)
export type Queue = SchemaDocument<typeof schema>
