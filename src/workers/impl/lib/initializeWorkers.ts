import { workers } from "../..";
import { getQueues } from "../../../database/impl/queues/impl/get";
import emitter, { Events } from "../../../events";
import { changeNickname } from "../functions/changeNickname";
import { joinVC } from "../functions/joinVC";
import { registerCommands } from "./registerCommands";
import { registerEvents } from "./registerEvents";

export const initializeWorkers = async (guildId: string) => {
    for (const worker of workers) {
        if (worker.data.guild_id !== guildId) continue;

        await registerEvents(worker);
        await registerCommands(worker);

        await worker.client.login(worker.data.credentials.client_token);

        await emitter.emit(Events.WORKER_READY, worker);
    }

    const queues = await getQueues(guildId);
    if (!queues || queues.length === 0) return;

    for (const queue of queues) {
        const worker = workers.find((w) => w.data.guild_id === guildId && w.data.vc === true);
        if (worker) {
            await joinVC(worker, queue.channel_id);
            await changeNickname(worker, String(queue.players.length) + "/2");
        }
    }
};
