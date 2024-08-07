export const env = {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgres://user:password@localhost:5432/dbname",
    CLIENT_ID: process.env.CLIENT_ID ?? "1234567890",
    CLIENT_TOKEN: process.env.CLIENT_TOKEN ?? "my-secret",
    GUILD_ID: process.env.GUILD_ID ?? "1234567890",
    USE_GUILD_COMMANDS: process.env.USE_GUILD_COMMANDS?.toLowerCase() === "true",
};
