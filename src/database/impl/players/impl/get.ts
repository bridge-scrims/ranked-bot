import { QueryConfig } from "pg";
import { postgres } from "../../..";
import { tableName } from "..";
import { Player } from "../../../../types";

export const getPlayer = async (guildId: string, memberId: string): Promise<Player | undefined> => {
    const query: QueryConfig = {
        text: `
            SELECT
                *
            FROM
                ${tableName}
            WHERE
                guild_id = $1
            AND
                user_id = $2
        `,
        values: [guildId, memberId],
    };

    const result = await postgres.query(query);
    return result.rows[0];
};
