/**
 * @description Exports the database
 */

import { init as initDatabase, postgres } from "../../database";
import { tableName as queuesTableName } from "../../database/impl/queues";
import { tableName as playersTableName } from "../../database/impl/players";
import { tableName as gamesTableName } from "../../database/impl/games";

import colors from "colors";
import { Script } from "../../types";

const dropDatabase = async () => {
    await initDatabase();

    console.log(colors.yellow("Dropping tables..."));

    await postgres.query(`DROP TABLE IF EXISTS ${queuesTableName}`);
    console.log(colors.green(`Dropped table ${queuesTableName} successfully!`));
    await postgres.query(`DROP TABLE IF EXISTS ${playersTableName}`);
    console.log(colors.green(`Dropped table ${playersTableName} successfully!`));
    await postgres.query(`DROP TABLE IF EXISTS ${gamesTableName}`);
    console.log(colors.green(`Dropped table ${gamesTableName} successfully!`));

    console.log(colors.green("Dropped tables successfully!"));
};

export default {
    name: "drop",
    description: "Drops the tables of the database",
    action: dropDatabase,
} as Script;
