import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";

export const createGame = async (
    guildId: string,
    gameId: number,
    team1Ids: string[],
    team2Ids: string[],
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
                team1_ids,
                team2_ids,
                channel_ids
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
        `,
        values: [guildId, gameId, JSON.stringify(team1Ids), JSON.stringify(team2Ids), JSON.stringify(channelIds)],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_GAMES_CREATE, {
        guildId,
        team1Ids,
        team2Ids,
        channelIds,
    });
};
