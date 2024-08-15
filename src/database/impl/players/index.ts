/**
 * @description Handles all player related database operations.
 */
export const tableName = "ranked_players";

export const table = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        mc_uuid TEXT NOT NULL,
        elo DECIMAL NOT NULL DEFAULT 1000.0,
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        win_streak INTEGER NOT NULL DEFAULT 0,
        best_win_streak INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
`;
