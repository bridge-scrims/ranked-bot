/**
 * @description Exports the database
 */

import { init as initDatabase, postgres } from "../../database";
import { tableName as playersTableName } from "../../database/impl/players";
import { tableName as queuesTableName } from "../../database/impl/queues";
import { tableName as gamesTableName } from "../../database/impl/games";

import colors from "colors";
import { Script } from "../../types";

const resetSeason = async () => {
    await initDatabase();

    await postgres.query(`UPDATE ${queuesTableName} SET players = ARRAY[]::JSONB[]`);
    console.log(colors.gray("Reset all queues."));

    await postgres.query(`UPDATE ${playersTableName} SET elo = 1000, wins = 0, losses = 0, win_streak = 0, best_win_streak = 0`);
    console.log(colors.gray("Reset all player stats."));

    await postgres.query(`DELETE FROM ${gamesTableName}`);
    console.log(colors.gray("Deleted all games."));

    console.log(colors.green(`Reset the season.`));
};

export default {
    name: "reset-season",
    description: "Resets the season.",
    action: resetSeason,
} as Script;
