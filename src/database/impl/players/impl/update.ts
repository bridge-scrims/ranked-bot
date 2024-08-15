import { QueryConfig } from "pg";
import { Player } from "../../../../types";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";

export const updatePlayer = async (guildId: string, playerId: string, data: Partial<Player>) => {
    const query: QueryConfig = {
        text: `UPDATE ${tableName} SET ${Object.keys(data)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ")} WHERE guild_id = $${Object.keys(data).length + 1} AND id = $${Object.keys(data).length + 2}`,
        values: [...Object.values(data), guildId, playerId],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_PLAYER_UPDATE, { guildId, playerId, data });
};
