import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";
import { randomUUID } from "crypto";
import { encrypt } from "../../../../helper/impl/encryption";

export const createQueue = async (
    guildId: string,
    channelId: string,
    channelName: string,
    workers: {
        client_id: string;
        client_token: string;
    }[],
) => {
    const query: QueryConfig = {
        text: `
            INSERT INTO ${tableName} (
                guild_id,
                channel_id,
                channel_name,
                players,
                workers
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
        `,
        values: [
            guildId,
            channelId,
            channelName,
            [],
            workers.map((worker) => {
                return {
                    id: randomUUID(),
                    guild_id: guildId,
                    credentials: {
                        client_id: encrypt(worker.client_id),
                        client_token: encrypt(worker.client_token),
                    },
                    created_at: new Date().toISOString(),
                };
            }),
        ],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_QUEUE_CREATE, {
        guildId,
        channelId,
        channelName,
        workers,
    });
};
