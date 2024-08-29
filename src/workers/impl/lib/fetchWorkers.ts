import { Client, GatewayIntentBits } from "discord.js";
import { getQueues } from "../../../database/impl/queues/impl/get";
import { workers } from "../..";
import emitter, { Events } from "../../../events";

export const fetchWorkers = async (guildId: string) => {
    const queues = await getQueues(guildId);
    if (!queues || queues.length === 0) return;

    // Clear workers array
    workers.length = 0;

    for (const queue of queues) {
        for (const worker of queue.workers) {
            const client = new Client({
                shards: "auto",
                intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions],
                presence: {
                    status: "invisible",
                },
            });

            workers.push({
                id: worker.id,
                client,
                data: worker,
            });

            await emitter.emit(Events.WORKER_FETCHED, worker);
        }
    }
};
