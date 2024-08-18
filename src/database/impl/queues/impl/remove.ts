import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";
import { getPlayer } from "../../players/impl/get";
import { getQueue } from "./get";

export const removeFromQueue = async (guildId: string, channelId: string, memberId: string) => {
    const player = await getPlayer(guildId, memberId);

    if (!player) return;

    const currentQueue = await getQueue(guildId, channelId);
    const players = currentQueue?.players || [];

    if (players.find((p) => p.user_id === memberId)) {
        const newPlayers = players.filter((p) => p.user_id !== memberId);

        const query: QueryConfig = {
            text: `
                UPDATE ${tableName}
                    SET players = $1
                WHERE guild_id = $2 AND channel_id = $3
            `,
            values: [newPlayers, guildId, channelId],
        };

        await postgres.query(query);

        await emitter.emit(Events.QUEUE_PLAYER_REMOVE, {
            guildId,
            channelId,
            memberId,
        });
    }
};
