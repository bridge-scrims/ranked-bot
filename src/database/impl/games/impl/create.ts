import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";
import { getGames } from "./get";

export const createGame = async (guildId: string, player1: string, player2: string): Promise<number> => {
    const games = await getGames(guildId);

    const query: QueryConfig = {
        text: `
            INSERT INTO ${tableName} (
                guild_id,
                game_id,
                player1_id,
                player2_id
            ) VALUES (
                $1,
                $2,
                $3,
                $4
            )
        `,
        values: [guildId, games.length + 1, player1, player2],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_GAMES_CREATE, {
        guildId,
        player1,
        player2,
    });

    return games.length + 1;
};
