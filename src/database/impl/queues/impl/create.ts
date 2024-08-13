import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";

export const createQueue = async (guildId: string, channelId: string, channelName: string) => {
    const query: QueryConfig = {
        text: `
            INSERT INTO ${tableName} (
                guild_id,
                channel_id,
                channel_name,
                players
            ) VALUES (
                $1,
                $2,
                $3,
                $4
            )
        `,
        values: [guildId, channelId, channelName, []],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_QUEUE_CREATE, {
        guildId,
        channelId,
        channelName,
    });
};
