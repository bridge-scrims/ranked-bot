/**
 * @description Handles all player related database operations.
 */
export const tableName = "ranked_games";

export const table = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id INT NOT NULL,
        guild_id TEXT NOT NULL,
        team1_ids JSONB NOT NULL DEFAULT '[]',
        team2_ids JSONB NOT NULL DEFAULT '[]',
        team1_score INT NOT NULL DEFAULT 0,
        team2_score INT NOT NULL DEFAULT 0,
        channel_ids JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
`;
