import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";

export const createGame = async (
    guildId: string,
    gameId: number,
    player1: string,
    player2: string,
    channelIds: {
        textChannel: string;
        vc1: string;
        vc2: string;
    },
) => {
    const query: QueryConfig = {
        text: `
            INSERT INTO ${tableName} (
                guild_id,
                game_id,
                player1_id,
                player2_id,
                channel_ids
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
        `,
        values: [guildId, gameId, player1, player2, JSON.stringify(channelIds)],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_GAMES_CREATE, {
        guildId,
        player1,
        player2,
        channelIds,
    });
};
