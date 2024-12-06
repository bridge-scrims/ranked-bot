import { Queue } from "@/database"
import { client } from "@/discord"
import { addToQueue } from "."

const TIMEOUT = 60 * 1000
const cooldowns = new Set<string>()

export function addCooldown(player: string) {
    cooldowns.add(player)
    setTimeout(() => removeCooldown(player), TIMEOUT)
}

export function onCooldown(player: string) {
    return cooldowns.has(player)
}

export function removeCooldown(player: string) {
    cooldowns.delete(player)
    for (const guild of client.guilds.cache.values()) {
        const member = guild.members.cache.get(player)
        if (member?.voice.channelId) {
            const queue = Queue.cache.get(member.voice.channelId)
            if (queue) {
                addToQueue(queue, player)
                break
            }
        }
    }
}
