import { QueryConfig } from "pg";
import { postgres } from "../../..";
import { tableName } from "..";
import { Queue } from "../../../../types";
import { decrypt } from "../../../../helper/impl/decryption";

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
    const data = result.rows[0];
    // Decrypt workers data
    if (data?.workers && Array.isArray(data.workers)) {
        data.workers = data.workers.map((worker: any) => {
            return {
                ...worker,
                credentials: {
                    client_id: decrypt(worker.credentials.client_id),
                    client_token: decrypt(worker.credentials.client_token),
                },
            };
        });
    }

    return data;
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
    const data = result.rows;
    for (const queue of data) {
        // Decrypt workers data
        if (queue?.workers && Array.isArray(queue.workers)) {
            queue.workers = queue.workers.map((worker: any) => {
                return {
                    ...worker,
                    credentials: {
                        client_id: decrypt(worker.credentials.client_id),
                        client_token: decrypt(worker.credentials.client_token),
                    },
                };
            });
        }
    }

    return data;
};
