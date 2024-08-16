/**
 * @description Main database entry point.
 */

import { Client } from "pg";
import { env } from "../env";
import emitter, { Events } from "../events";
import { table as queuesTable, tableName as queuesTableName } from "./impl/queues";
import { table as playersTable, tableName as playersTableName } from "./impl/players";
import { table as gamesTable, tableName as gamesTableName } from "./impl/games";
import colors from "colors";

export const postgres = new Client(env.DATABASE_URL);

export const init = async () => {
    await postgres.connect();
    await emitter.emit(Events.DATABASE_CONNECT);

    await createTables();

    await emitter.emit(Events.DATABASE_INITIATED);
};

const createTables = async () => {
    const tables = await getCurrentTables();
    try {
        if (!tables.includes(queuesTableName)) {
            await postgres.query(queuesTable);
            console.log(colors.green("Created queues table."));
        } else {
            //const currentSchema = await postgres.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${queuesTableName}';`);
            //const columns = currentSchema.rows.map((row) => row.column_name);
        }

        if (!tables.includes(playersTableName)) {
            await postgres.query(playersTable);
            console.log(colors.green("Created players table."));
        } else {
            //const currentSchema = await postgres.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${playersTableName}';`);
            //const columns = currentSchema.rows.map((row) => row.column_name);
        }

        if (!tables.includes(gamesTableName)) {
            await postgres.query(gamesTable);
            console.log(colors.green("Created games table."));
        } else {
            //const currentSchema = await postgres.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${gamesTableName}';`);
            //const columns = currentSchema.rows.map((row) => row.column_name);
        }
    } catch (e) {
        console.error(e);
    }
};

const getCurrentTables = async () => {
    const res = await postgres.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    return res.rows.map((row) => row.table_name);
};
