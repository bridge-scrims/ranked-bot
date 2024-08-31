import { QueryConfig } from "pg";
import { postgres } from "../../..";
import { tableName } from "..";
import { getQueue } from "./get";

export const clearQueue = async (guildId: string, channelId: string) => {
    const currentQueue = await getQueue(guildId, channelId);
    if (!currentQueue) return;

    const query: QueryConfig = {
        text: `
            UPDATE ${tableName} SET players = $1 WHERE guild_id = $2 AND channel_id = $3
        `,
        values: [[], guildId, channelId],
    };

    await postgres.query(query);
};
