export const env = {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgres://user:password@localhost:5432/dbname",
    CLIENT_ID: process.env.CLIENT_ID ?? "1234567890",
    CLIENT_TOKEN: process.env.CLIENT_TOKEN ?? "my-secret",
    SALT_KEY: process.env.SALT_KEY ?? "a1b2c3d4e5f6g7h8i9j0",
    GUILD_ID: process.env.GUILD_ID ?? "1234567890",
    USE_GUILD_COMMANDS: process.env.USE_GUILD_COMMANDS?.toLowerCase() === "true",
};
