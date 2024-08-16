import { QueryConfig } from "pg";
import { postgres } from "../../..";
import { tableName } from "..";
import { Player } from "../../../../types";

export const getPlayer = async (guildId: string, memberId: string): Promise<Player | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND
                user_id = $2
        `,
        values: [guildId, memberId],
    };

    const result = await postgres.query(query);
    return result.rows[0];
};

export const getLeaderboard = async (guildId: string, type: "elo" | "wins" | "losses" | "best_win_streak", page: number = 0): Promise<Player[] | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            ORDER BY
                ${type} DESC
            LIMIT 10
            OFFSET $2
        `,
        values: [guildId, page * 10],
    };

    const result = await postgres.query(query);
    return result.rows;
};
