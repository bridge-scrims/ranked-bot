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
        console.log(colors.gray(`Player created for guild ${data.guildId} with user ${data.userId} and Minecraft UUId ${data.mcUUID}`));
    });

    emitter.on(Events.QUEUE_PLAYER_ADD, async (data) => {
        console.log(colors.gray(`Player ${data.memberId} added to queue for guild ${data.guildId} in channel ${data.channelId}`));
    });

    emitter.on(Events.QUEUE_PLAYER_REMOVE, async (data) => {
        console.log(colors.gray(`Player ${data.memberId} removed from queue for guild ${data.guildId} in channel ${data.channelId}`));
    });

    emitter.on(Events.DISCORD_READY, async () => {
        console.log(colors.green("Discord bot is ready!"));
    });

    emitter.on(Events.DISCORD_COMMAND_REGISTER, async (data) => {
        console.log(colors.gray(`Command registered: ${data.name}`));
    });
};
