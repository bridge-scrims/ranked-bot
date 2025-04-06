import { Queue } from "@/database"
import { decrypt } from "@/util/encryption"
import { Client } from "discord.js"
import { joinQueueChannel } from "./functions/joinChannel"
import { clearStatus, updateStatus } from "./functions/updateStatus"

const workers: Map<string, Client> = new Map()
Queue.cache.on("add", (queue) => addWorker(queue))
Queue.cache.on("delete", (queue) => removeWorker(queue._id))

function addWorker(queue: Queue) {
    removeWorker(queue._id)
    workers.set(queue._id, initWorker(queue))
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
            console.log(`${client.user!.tag} ready as a worker for ${queue._id}.`)
            updateStatus(queue)

            joinQueueChannel(client, queue).catch(console.error)
            const interval = setInterval(() => {
                if (client.isReady()) {
                    joinQueueChannel(client, queue).catch(console.error)
                } else {
                    clearInterval(interval)
                }
            }, 60 * 1000)
        })

    client.login(decrypt(queue.token)).catch(console.error)
    return client
}

export function getWorker(queue: Queue) {
    return workers.get(queue._id)
}

export async function destroyWorkers() {
    await Promise.all(
        Array.from(workers.entries()).map(([queueId, client]) => {
            const queue = Queue.cache.get(queueId)!
            clearStatus(queue)
            return client.destroy()
        }),
    )
}
