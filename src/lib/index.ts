import { Glicko2 } from "glicko2";
import { getQueues } from "../database/impl/queues/impl/get";
import { interval } from "./impl/queue/interval";
import emitter, { Events } from "../events";

export const apiURL = "https://api.scrims.network/v1";
export const ranking = new Glicko2({
    tau: 0.9,
    rating: 1000,
    rd: 16 * 4.69,
    vol: 0.06,
});

export const DEFAULT_RANGE = 25;
export const RANGE_EXPANSION_RATE = 25;

export const initQueue = async (guildId: string) => {
    const queues = (await getQueues(guildId)) ?? [];
    for (const queue of queues) {
        await interval(queue.guild_id, queue.channel_id);
        await emitter.emit(Events.QUEUE_READY, queue);
    }
};

/**
 * @description Credit to NiteBlock and Tofaa. Used for preventing the Discord bot from dying lol
 */
export const antiCrash = () => {
    process.on("uncaughtException", (err) => {
        console.error(err);
    });
    process.on("unhandledRejection", (err) => {
        console.error(err);
    });

    process.on("SIGINT", () => {
        process.exit();
    });
};
