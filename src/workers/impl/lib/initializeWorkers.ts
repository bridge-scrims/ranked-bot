import { workers } from "../..";
import emitter, { Events } from "../../../events";
import { registerCommands } from "./registerCommands";

export const initializeWorkers = async (guildId: string) => {
    for (const worker of workers) {
        if (worker.data.guild_id !== guildId) continue;

        //await registerEvents();
        await registerCommands(worker);

        await worker.client.login(worker.data.credentials.client_token);
        await emitter.emit(Events.WORKER_READY, worker);
    }
};
