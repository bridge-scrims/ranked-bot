import { QueryConfig } from "pg";
import { Game } from "../../../../types";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";

export const updateGame = async (guildId: string, gameId: string, data: Partial<Game>) => {
    const query: QueryConfig = {
        text: `UPDATE ${tableName} SET ${Object.keys(data)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ")} WHERE guild_id = $${Object.keys(data).length + 1} AND id = $${Object.keys(data).length + 2}`,
        values: [...Object.values(data), guildId, gameId],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_GAMES_UPDATE, { guildId, gameId, data });
};
