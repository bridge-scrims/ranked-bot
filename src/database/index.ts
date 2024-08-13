/**
 * @description Main database entry point.
 */

import { Client } from "pg";
import { env } from "../env";
import emitter, { Events } from "../events";
import { table as queuesTable } from "./impl/queues";
import { table as playersTable } from "./impl/players";
import { table as gamesTable } from "./impl/games";

export const postgres = new Client(env.DATABASE_URL);

export const init = async () => {
    await postgres.connect();
    await emitter.emit(Events.DATABASE_CONNECT);

    await createTables();
};

const createTables = async () => {
    await postgres.query(queuesTable);
    await postgres.query(playersTable);
    await postgres.query(gamesTable);
};
