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
    gameChannelId: string,
    workers: {
        client_id: string;
        client_token: string;
        vc: boolean;
    }[],
) => {
    const query: QueryConfig = {
        text: `
            INSERT INTO ${tableName} (
                guild_id,
                channel_id,
                channel_name,
                game_channel_id,
                players,
                workers
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
        `,
        values: [
            guildId,
            channelId,
            channelName,
            gameChannelId,
            [],
            workers.map((worker) => {
                return {
                    id: randomUUID(),
                    guild_id: guildId,
                    credentials: {
                        client_id: encrypt(worker.client_id),
                        client_token: encrypt(worker.client_token),
                    },
                    vc: worker.vc,
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
        gameChannelId,
        workers,
    });
};
