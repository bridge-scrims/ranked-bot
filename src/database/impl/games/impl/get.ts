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

export const getGamesByPage = async (guildId: string, page: number = 0): Promise<Game[]> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            ORDER BY
                created_at DESC
            LIMIT 10
            OFFSET $2
        `,
        values: [guildId, page * 10],
    };

    const result = await postgres.query(query);
    return result.rows;
};

export const getGamesByPlayer = async (guildId: string, playerId: string, page: number = 0): Promise<Game[]> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND (
                team1_ids @> $2::jsonb
                OR
                team2_ids @> $2::jsonb
            )
            ORDER BY
                created_at DESC
            LIMIT 10
            OFFSET $3
        `,
        values: [guildId, JSON.stringify(playerId), page * 10],
    };

    const result = await postgres.query(query);
    return result.rows;
};

export const getGamesPlayed = async (guildId: string, playerId: string): Promise<number> => {
    const query: QueryConfig = {
        text: `
            SELECT
                COUNT(*)
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND (
                team1_ids @> $2::jsonb
                OR
                team2_ids @> $2::jsonb
            )
        `,
        values: [guildId, JSON.stringify([playerId])],
    };

    const result = await postgres.query(query);
    return parseInt(result.rows[0].count);
};
