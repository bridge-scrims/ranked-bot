import { Queue } from "@/database"
import { decrypt } from "@/util/encryption"
import { Client } from "discord.js"
import { stayConnected } from "./functions/stayConnected"
import { updateStatus } from "./functions/updateStatus"

const workers: Map<string, Client> = new Map()
Queue.cache.on("add", (queue) => addWorker(queue))
Queue.cache.on("delete", (queue) => removeWorker(queue.id))

function addWorker(queue: Queue) {
    removeWorker(queue.id)
    workers.set(queue.id, initWorker(queue))
}

function removeWorker(queueId: string) {
    const worker = workers.get(queueId)
    worker?.destroy().catch(console.error)
    workers.delete(queueId)
}

function initWorker(queue: Queue) {
    const client = new Client({ intents: [], presence: { status: "invisible" } })
        .on("error", console.error)
        .on("ready", () => {
            console.log(`${client.user!.tag} ready as a worker.`)
            updateStatus(queue).catch(console.error)
            stayConnected(client, queue)
        })
        .on("guildCreate", (guild) => {
            if (guild.id === queue.guildId) {
                updateStatus(queue).catch(console.error)
            }
        })

    client.login(decrypt(queue.token)).catch(console.error)
    return client
}

export function getWorker(queue: Queue) {
    return workers.get(queue.id)
}

export async function destroyWorkers() {
    await Promise.all(Array.from(workers.values()).map((v) => v.destroy().catch(console.error)))
}
