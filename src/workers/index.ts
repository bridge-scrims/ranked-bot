import { Queue } from "@/database"
import { decrypt } from "@/util/encryption"
import { addShutdownTask } from "@/util/shutdown"
import { Client, GatewayIntentBits } from "discord.js"
import { joinQueueChannel } from "./functions/joinChannel"
import { clearStatus } from "./functions/updateStatus"

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

const INTENTS = [GatewayIntentBits.GuildVoiceStates]

function initWorker(queue: Queue) {
    const client = new Client({ intents: INTENTS, presence: { status: "invisible" } })
        .on("error", console.error)
        .on("ready", () => {
            console.log(`${client.user!.tag} ready as a worker for ${queue._id}.`)
            joinQueueChannel(client, queue).catch(console.error)
        })

    client.login(decrypt(queue.token)).catch(console.error)
    return client
}

export function getWorker(queue: Queue) {
    return workers.get(queue._id)
}

addShutdownTask(() =>
    Promise.all(
        Array.from(workers.entries()).map(([queueId, client]) => {
            const queue = Queue.cache.get(queueId)!
            clearStatus(queue)
            return client.destroy()
        }),
    ),
)
