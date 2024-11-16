import { ChannelType } from "discord.js";
import { workers } from "../..";
import { getQueues } from "../../../database/impl/queues/impl/get";
import emitter, { Events } from "../../../events";
import { changeNickname } from "../functions/changeNickname";
import { joinVC } from "../functions/joinVC";
import { registerCommands } from "./registerCommands";
import { registerEvents } from "./registerEvents";
import { getPlayer } from "../../../database/impl/players/impl/get";
import { addToQueue } from "../../../database/impl/queues/impl/add";

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

        const currentVC = worker?.client.channels.cache.get(queue.channel_id);

        if (currentVC?.type === ChannelType.GuildVoice) {
            const voiceChannel = currentVC; // Explicit cast if needed

            // Fetch the members currently in the voice channel
            const membersInVC = voiceChannel.members.map((member) => ({
                id: member.id,
                username: member.user.username,
                nickname: member.nickname,
                joinedTimestamp: member.joinedTimestamp,
            }));

            const promises = [];
            for (const member of membersInVC) {
                const promise = new Promise<void>(async (resolve) => {
                    const isWorker = workers.find((w) => w.data.guild_id === guildId && w.data.id === member.id);
                    if (isWorker) {
                        return resolve();
                    }

                    const isRegistered = await getPlayer(guildId, member.id);
                    if (isRegistered) {
                        const isInQueue = queue.players.find((p) => p.id === member.id);
                        if (!isInQueue) {
                            await addToQueue(guildId, queue.channel_id, member.id);
                        }
                    }

                    return resolve();
                });

                promises.push(promise);
            }

            await Promise.all(promises);

            await emitter.emit(Events.QUEUE_SYNC, queue);

            if (worker) {
                // Example usage: update the nickname with member count
                await joinVC(worker, queue.channel_id);
                await changeNickname(worker, `${membersInVC.length}/2`);
            }
        }
    }
};
