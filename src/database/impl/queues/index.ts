/**
 * @description Handles all queue related database operations.
 */

export const table = `
    CREATE TABLE IF NOT EXISTS queues (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        channel_name TEXT NOT NULL,
        players JSONB[] DEFAULT ARRAY[]::JSONB[]
    );
`;
