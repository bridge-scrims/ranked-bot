import emitter, { Events } from "..";
import colors from "colors";

export const listener = async () => {
    emitter.on(Events.DATABASE_CONNECT, async () => {
        console.log(colors.green("Database connected!"));
    });

    emitter.on(Events.DATABASE_INITIATED, async () => {
        console.log(colors.green("Initiated database!"));
    });

    emitter.on(Events.DATABASE_QUEUE_CREATE, async (data) => {
        console.log(colors.gray(`Queue created for guild ${data.guildId} in channel ${data.channelId}`));
    });

    emitter.on(Events.DATABASE_PLAYER_CREATE, async (data) => {
        console.log(colors.gray(`Player created for guild ${data.guildId} with user ${data.userId} and Minecraft UUID ${data.mcUUID}`));
    });

    emitter.on(Events.DATABASE_PLAYER_UPDATE, async (data) => {
        console.log(colors.gray(`Player updated for guild ${data.guildId} and player ${data.playerId}`));
    });

    emitter.on(Events.DATABASE_GAMES_CREATE, async (data) => {
        console.log(colors.gray(`Game created for guild ${data.guildId} with players ${data.player1} and ${data.player2}`));
    });

    emitter.on(Events.DATABASE_GAMES_UPDATE, async (data) => {
        console.log(colors.gray(`Game updated for guild ${data.guildId} and game ${data.gameId}`));
    });

    emitter.on(Events.QUEUE_PLAYER_ADD, async (data) => {
        console.log(colors.gray(`Player ${data.memberId} added to queue for guild ${data.guildId} in channel ${data.channelId}`));
    });

    emitter.on(Events.QUEUE_PLAYER_REMOVE, async (data) => {
        console.log(colors.gray(`Player ${data.memberId} removed from queue for guild ${data.guildId} in channel ${data.channelId}`));
    });

    emitter.on(Events.GAME_CREATE, async (data) => {
        console.log(colors.gray(`Game created for guild ${data.guildId} with players ${data.player1} and ${data.player2}`));
    });

    emitter.on(Events.GAME_FINISH, async (data) => {
        console.log(colors.gray(`Game finished for guild ${data.guildId} and game ${data.gameId}. Ready to score.`));
    });

    emitter.on(Events.GAME_SCORED, async (data) => {
        console.log(colors.gray(`Game scored for guild ${data.guildId} and game ${data.game.id}. Player 1 elo change: ${data.p1EloChange}. Player 2 elo change: ${data.p2EloChange}`));
    });

    emitter.on(Events.DISCORD_READY, async () => {
        console.log(colors.green("Discord bot is ready!"));
    });

    emitter.on(Events.DISCORD_COMMAND_REGISTER, async (data) => {
        console.log(colors.gray(`Command registered: ${data.name}`));
    });
};
