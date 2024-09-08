/**
 * @description Exports the database
 */

import { init as initDatabase, postgres } from "../../database";
import { tableName as queuesTableName } from "../../database/impl/queues";
import { tableName as playersTableName } from "../../database/impl/players";
import { tableName as gamesTableName } from "../../database/impl/games";

import colors from "colors";
import { Script } from "../../types";
import { isString } from "../../helper";

const exportDatabase = async (name?: string) => {
    await initDatabase();

    const fileName = name && isString(name) ? name : "database.json";
    const BATCH_SIZE = 100;

    const file = Bun.file(fileName);
    if (await file.exists()) {
        console.log(colors.yellow("WARNING: ") + colors.gray(fileName) + colors.yellow(" already exists!"));

        // Overwrite
        const writer = file.writer();
        writer.write("");
    }

    const exportData = async (tableName: string) => {
        let offset = 0;
        let allRows: any[] = [];

        console.log(colors.yellow(`Exporting ${tableName}...`) + colors.gray(` (batch size: ${BATCH_SIZE})`));

        while (true) {
            const query = `SELECT * FROM ${tableName} LIMIT ${BATCH_SIZE} OFFSET ${offset}`;
            const rows = (await postgres.query(query)).rows;

            if (rows.length === 0) {
                break;
            }

            allRows = allRows.concat(rows);
            offset += BATCH_SIZE;
        }

        console.log(colors.green(`Exported ${tableName} successfully!`) + colors.gray(` (${allRows.length} rows)`));
        return allRows;
    };

    const queues = await exportData(queuesTableName);
    const players = await exportData(playersTableName);
    const games = await exportData(gamesTableName);

    const writer = file.writer();

    /**
     * Write the queues
     */

    console.log(colors.yellow("Writing queues..."));

    writer.write("{");
    writer.write('"queues": [');

    for (let i = 0; i < queues.length; i++) {
        writer.write(JSON.stringify(queues[i]));

        if (i !== queues.length - 1) {
            writer.write(",");
        }
    }

    writer.write("],");

    console.log(colors.green("Wrote queues successfully!"));

    /**
     * Write the players
     */

    console.log(colors.yellow("Writing players..."));

    writer.write('"players": [');

    for (let i = 0; i < players.length; i++) {
        writer.write(JSON.stringify(players[i]));

        if (i !== players.length - 1) {
            writer.write(",");
        }
    }

    writer.write("],");

    console.log(colors.green("Wrote players successfully!"));

    /**
     * Write the games
     */

    console.log(colors.yellow("Writing games..."));

    writer.write('"games": [');

    for (let i = 0; i < games.length; i++) {
        writer.write(JSON.stringify(games[i]));

        if (i !== games.length - 1) {
            writer.write(",");
        }
    }

    writer.write("]");

    console.log(colors.green("Wrote games successfully!"));

    writer.write("}");
    writer.end();

    console.log(colors.green(`Exported database to ${fileName} successfully!`));
};

export default {
    name: "export",
    description: "Exports the database",
    action: exportDatabase,
} as Script;
