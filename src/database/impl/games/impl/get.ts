import { QueryConfig } from "pg";
import { postgres } from "../../..";
import { tableName } from "..";
import { Game } from "../../../../types";

export const getGame = async (guildId: string, id: string): Promise<Game | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND
                id = $2
        `,
        values: [guildId, id],
    };

    const result = await postgres.query(query);
    return result.rows[0];
};

export const getGameByGameId = async (guildId: string, gameId: number): Promise<Game | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND
                game_id = $2
        `,
        values: [guildId, gameId],
    };

    const result = await postgres.query(query);
    return result.rows[0];
};

export const getGameByChannelId = async (guildId: string, channelId: string, channelType: "textChannel" | "vc1" | "vc2"): Promise<Game | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND
                channel_ids->>$2 = $3
        `,
        values: [guildId, channelType, channelId],
    };

    const result = await postgres.query(query);
    return result.rows[0];
};

export const getGames = async (guildId: string): Promise<Game[]> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
        `,
        values: [guildId],
    };

    const result = await postgres.query(query);
    return result.rows;
};
