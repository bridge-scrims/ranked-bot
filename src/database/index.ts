/**
 * @description Main database entry point.
 */

import { Client } from "pg";
import { env } from "../env";
import emitter, { Events } from "../events";
import { table as queueTable } from "./impl/queues";

export const postgres = new Client(env.DATABASE_URL);

export const init = async () => {
    await postgres.connect();
    await emitter.emit(Events.DATABASE_CONNECT);

    await createTables();
};

const createTables = async () => {
    await postgres.query(queueTable);
};
