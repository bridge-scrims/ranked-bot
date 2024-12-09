import { userMention } from "discord.js"

import { DEFAULT_ELO, SEASON, Stats } from "@/Constants"
import {
    Document,
    getSchemaFromClass,
    LongProp,
    modelSchema,
    Prop,
    UuidProp,
    type SchemaDocument,
} from "../util"

interface RankedStats {
    elo: number
    wins: number
    losses: number
    draws: number
    winStreak: number
    bestWinStreak: number
}

const DEFAULT_STATS: RankedStats = {
    elo: DEFAULT_ELO,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    bestWinStreak: 0,
}

@Document("Player", "userprofiles")
class Template {
    static getMcUuid(id: string) {
        return mcCache.get(id)
    }

    static async setMcUuid(id: string, uuid: string) {
        await Promise.all([
            Player.updateMany({ _id: { $ne: id }, mcUUID: uuid }, { $unset: { mcUUID: "" } }),
            Player.updateOne({ _id: id }, { mcUUID: uuid }, { upsert: true }),
        ])
        mcCache.set(id, uuid)
    }

    static getRankedElo(id: string) {
        return eloCache.get(id) ?? DEFAULT_ELO
    }

    static updateElo(id: string, elo: number) {
        eloCache.set(id, elo)
    }

    @LongProp({ required: true })
    _id!: string

    @UuidProp({ required: false })
    mcUUID?: string

    @Prop({ type: Object, required: false })
    ranked?: Record<string, Partial<RankedStats>>

    getRankedStats(): RankedStats {
        return { ...DEFAULT_STATS, ...this.ranked?.[SEASON] }
    }

    toString() {
        return userMention(this._id)
    }
}

const schema = getSchemaFromClass(Template)
export const Player = modelSchema(schema, Template)
export type Player = SchemaDocument<typeof schema>

const eloCache = new Map<string, number>()
const mcCache = new Map<string, string>()

const elo = Stats.Elo
Player.find({}, { mcUUID: 1, [elo]: 1 }).then((players) => {
    players.forEach((v) => {
        const elo = v.getRankedStats()?.elo
        if (elo !== undefined) eloCache.set(v.id, elo)
        if (v.mcUUID !== undefined) mcCache.set(v.id, v.mcUUID)
    })
})

Player.watcher().on("update", (_v, _id, doc) => {
    if (doc) {
        eloCache.set(doc.id, doc.getRankedStats().elo)
        if (doc.mcUUID) mcCache.set(doc.id, doc.mcUUID)
        else mcCache.delete(doc.id)
    }
})
