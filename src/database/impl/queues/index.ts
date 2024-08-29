/**
 * @description Handles all queue related database operations.
 */

export const tableName = "ranked_queues";

export const table = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        channel_name TEXT NOT NULL,
        players JSONB[] DEFAULT ARRAY[]::JSONB[],
        workers JSONB[] DEFAULT ARRAY[]::JSONB[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
`;
