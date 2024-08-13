import { QueryConfig } from "pg";
import { postgres } from "../../..";
import emitter, { Events } from "../../../../events";
import { tableName } from "..";

export const createUser = async (guildId: string, userId: string, mcUUID: string) => {
    const query: QueryConfig = {
        text: `
            INSERT INTO ${tableName} (
                guild_id,
                user_id,
                mc_uuid
            ) VALUES (
                $1,
                $2,
                $3
            )
        `,
        values: [guildId, userId, mcUUID],
    };

    await postgres.query(query);

    await emitter.emit(Events.DATABASE_PLAYER_CREATE, {
        guildId,
        userId,
        mcUUID,
    });
};
