import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";
import { getPlayer } from "../../players/impl/get";
import { getQueue } from "./get";

export const addToQueue = async (guildId: string, channelId: string, memberId: string) => {
    const player = await getPlayer(guildId, memberId);

    if (!player) return console.log("Can't find player");

    const currentQueue = await getQueue(guildId, channelId);
    const players = currentQueue?.players || [];

    if (players.find((p) => p.user_id === memberId)) return;

    const newPlayers = [...players, player];

    const query: QueryConfig = {
        text: `
            UPDATE ${tableName}
                SET players = $1
            WHERE guild_id = $2 AND channel_id = $3
        `,
        values: [newPlayers, guildId, channelId],
    };

    await postgres.query(query);

    await emitter.emit(Events.QUEUE_PLAYER_ADD, {
        guildId,
        channelId,
        memberId,
    });
};
