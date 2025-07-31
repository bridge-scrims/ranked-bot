import { DocumentType, Prop } from "@typegoose/typegoose"
import { userMention } from "discord.js"
import { Types } from "mongoose"

import { DEFAULT_ELO, SEASON } from "@/Constants"
import { Document, modelClass } from "../util"

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
class PlayerClass {
    static async cacheInitialized() {
        await initialized.promise
    }

    static getMcUuid(id: string) {
        return discordToMc[id]
    }

    static resolveMcUuid(uuid: string) {
        return mcToDiscord[uuid]
    }

    static async setMcUuid(id: string, uuid: string) {
        discordToMc[id] = uuid
        mcToDiscord[uuid] = id
        await Promise.all([
            Player.updateMany({ _id: { $ne: id }, mcUUID: uuid }, { $unset: { mcUUID: "" } }),
            Player.updateOne({ _id: id }, { mcUUID: uuid }, { upsert: true }),
        ])
    }

    static getRankedElo(id: string) {
        return eloCache[id] ?? DEFAULT_ELO
    }

    static getGamesCount(id: string) {
        return gamesCache[id] ?? 0
    }

    static updateElo(id: string, elo: number) {
        eloCache[id] = elo
    }

    static incrementGames(id: string) {
        gamesCache[id] = this.getGamesCount(id) + 1
    }

    @Prop({ type: Types.Long, required: true })
    _id!: string

    @Prop({ type: Types.UUID, required: false })
    mcUUID?: string

    @Prop({ type: Object, required: false })
    ranked?: Record<string, Partial<RankedStats>>

    get id() {
        return this._id
    }

    getRankedStats(): RankedStats {
        return { ...DEFAULT_STATS, ...this.ranked?.[SEASON] }
    }

    getRankedElo(): number {
        return this.getRankedStats().elo
    }

    getRankedGames() {
        const stats = this.getRankedStats()
        return stats.wins + stats.losses + stats.draws
    }

    toString() {
        return userMention(this._id)
    }
}

export const Player = modelClass(PlayerClass)
export type Player = DocumentType<PlayerClass>

const initialized = Promise.withResolvers()
const eloCache: Record<string, number> = {}
const gamesCache: Record<string, number> = {}
const discordToMc: Record<string, string> = {}
const mcToDiscord: Record<string, string> = {}

Player.watcher()
    .on("open", () => {
        void Player.find({}, { mcUUID: 1, ranked: 1, toString: 1 }).then((players) => {
            players.forEach((v) => {
                eloCache[v._id] = v.getRankedElo()
                gamesCache[v._id] = v.getRankedGames()
                if (v.mcUUID !== undefined) {
                    discordToMc[v._id] = v.mcUUID
                    mcToDiscord[v.mcUUID] = v._id
                }
            })
            initialized.resolve(null)
        })
    })
    .on("update", (_v, _id, doc) => {
        if (doc) {
            eloCache[doc._id] = doc.getRankedElo()
            gamesCache[doc._id] = doc.getRankedGames()
            if (doc.mcUUID) {
                discordToMc[doc._id] = doc.mcUUID
                mcToDiscord[doc.mcUUID] = doc._id
            } else {
                delete mcToDiscord[discordToMc[doc._id]!]
                delete discordToMc[doc._id]
            }
        }
    })
