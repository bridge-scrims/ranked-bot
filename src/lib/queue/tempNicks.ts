import type { Queue } from "@/database"
import { client } from "@/discord"
import { updateNick } from "@/workers/functions/updateNick"

const previousNicks = new Map<string, string | null>()

export function setTempNick(queue: Queue, user: string, nick: string) {
    const guild = client.guilds.cache.get(queue.guildId)
    const member = guild?.members.cache.get(user)
    if (member && guild?.ownerId === member.id) {
        previousNicks.set(user, member.nickname)
        updateNick(queue, user, nick).catch(console.error)
    }
}

export function resetNick(queue: Queue, user: string) {
    const nick = previousNicks.get(user)
    if (nick !== undefined) {
        updateNick(queue, user, nick).catch(console.error)
        previousNicks.delete(user)
    }
}
