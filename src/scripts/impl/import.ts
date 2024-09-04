/**
 * @description Imports the database
 */

import { init as initDatabase, postgres } from "../../database";
import { tableName as queuesTableName } from "../../database/impl/queues";
import { tableName as playersTableName } from "../../database/impl/players";
import { tableName as gamesTableName } from "../../database/impl/games";

import colors from "colors";
import { Game, Player, Queue, Script } from "../../types";
import { getQueue } from "../../database/impl/queues/impl/get";
import { isString } from "../../helper";
import { getPlayer } from "../../database/impl/players/impl/get";
import { getGame } from "../../database/impl/games/impl/get";

const importDatabase = async (name?: string) => {
    await initDatabase();

    const fileName = name && isString(name) ? name : "database.json";

    const file = Bun.file(fileName);
    if (!(await file.exists())) throw new Error("File does not exist! You can run bun run import <file> to import data from a specific file path.");

    const data: {
        queues: Queue[];
        players: Player[];
        games: Game[];
    } = await file.json();
    console.log(colors.green("Successfully parsed data! Importing..."));

    const count = {
        queues: 0,
        players: 0,
        games: 0,
    };

    const failedCount = {
        queues: 0,
        players: 0,
        games: 0,
    };

    console.log(colors.yellow("Importing queues..."));

    for (const queue of data.queues) {
        if (await getQueue(queue.guild_id, queue.channel_id)) {
            console.log(colors.yellow(`Queue for ${queue.guild_id}#${queue.channel_id} already exists! Skipping...`));
            continue;
        }

        if (isString(queue.players)) {
            try {
                queue.players = JSON.parse(queue.players);
            } catch (e) {
                console.error(e);
                failedCount.queues++;
                continue;
            }
        }

        if (isString(queue.workers)) {
            try {
                queue.workers = JSON.parse(queue.workers);
            } catch (e) {
                console.error(e);
                failedCount.queues++;
                continue;
            }
        }

        try {
            await postgres.query(`INSERT INTO ${queuesTableName} (id, guild_id, channel_id, channel_name, game_channel_id, players, workers, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                queue.id,
                queue.guild_id,
                queue.channel_id,
                queue.channel_name,
                queue.game_channel_id,
                queue.players,
                queue.workers,
                queue.created_at,
            ]);
            count.queues++;

            console.log(colors.green(`Successfully imported queue for ${queue.guild_id}#${queue.channel_id}`));
        } catch (e) {
            console.error(e);
            failedCount.queues++;
        }
    }

    for (const player of data.players) {
        if (await getPlayer(player.guild_id, player.user_id)) {
            console.log(colors.yellow(`Player for ${player.guild_id}#${player.user_id} already exists! Skipping...`));
            continue;
        }

        try {
            await postgres.query(`INSERT INTO ${playersTableName} (id, guild_id, user_id, mc_uuid, elo, wins, losses, win_streak, best_win_streak, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
                player.id,
                player.guild_id,
                player.user_id,
                player.mc_uuid,
                player.elo,
                player.wins,
                player.losses,
                player.win_streak,
                player.best_win_streak,
                player.created_at,
            ]);
            count.players++;

            console.log(colors.green(`Successfully imported player for ${player.guild_id} and ID ${player.user_id}`));
        } catch (e) {
            console.error(e);
            failedCount.players++;
        }
    }

    for (const game of data.games) {
        if (await getGame(game.guild_id, game.id)) {
            console.log(colors.yellow(`Game for ${game.guild_id} and ID ${game.id} already exists! Skipping...`));
            continue;
        }

        if (isString(game.channel_ids)) {
            try {
                game.channel_ids = JSON.parse(game.channel_ids);
            } catch (e) {
                console.error(e);
                failedCount.games++;
                continue;
            }
        }

        try {
            await postgres.query(`INSERT INTO ${gamesTableName} (id, game_id, guild_id, player1_id, player2_id, player1_score, player2_score, channel_ids, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
                game.id,
                game.game_id,
                game.guild_id,
                game.player1_id,
                game.player2_id,
                game.player1_score,
                game.player2_score,
                game.channel_ids,
                game.created_at,
            ]);
            count.games++;

            console.log(colors.green(`Successfully imported game for ${game.guild_id} and ID ${game.id}`));
        } catch (e) {
            console.error(e);
            failedCount.games++;
        }
    }

    console.log(colors.green(`Successfully imported ${count.queues} queues, ${count.players} players, and ${count.games} games!`));
    if (failedCount.queues > 0) console.log(colors.red(`Failed to import ${failedCount.queues} queues!`));
    if (failedCount.players > 0) console.log(colors.red(`Failed to import ${failedCount.players} players!`));
    if (failedCount.games > 0) console.log(colors.red(`Failed to import ${failedCount.games} games!`));
};

export default {
    name: "import",
    description: "Imports the database",
    action: importDatabase,
} as Script;
