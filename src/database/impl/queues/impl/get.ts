import { QueryConfig } from "pg";
import { postgres } from "../../..";
import { tableName } from "..";
import { Queue } from "../../../../types";

export const getQueue = async (guildId: string, channelId: string): Promise<Queue | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND
                channel_id = $2
        `,
        values: [guildId, channelId],
    };

    const result = await postgres.query(query);
    return result.rows[0];
};

export const getQueues = async (guildId: string): Promise<Queue[] | undefined> => {
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
