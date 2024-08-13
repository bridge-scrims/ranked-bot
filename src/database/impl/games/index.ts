/**
 * @description Handles all player related database operations.
 */
export const tableName = "ranked_games";

export const table = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id INT NOT NULL,
        guild_id TEXT NOT NULL,
        player1_id TEXT NOT NULL,
        player2_id TEXT NOT NULL,
        player1_score INT NOT NULL DEFAULT 0,
        player2_score INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
`;
