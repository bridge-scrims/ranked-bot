import emitter, { Events } from "..";
import colors from "colors";
import { colors as discordColors } from "../../discord";
import { workers } from "../../workers";
import { changeNickname } from "../../workers/impl/functions/changeNickname";
import { getQueue, getQueues } from "../../database/impl/queues/impl/get";
import { sendMessageInChannel } from "../../workers/impl/functions/sendMessageInChannel";
import { EmbedBuilder } from "discord.js";
import { getPlayer } from "../../database/impl/players/impl/get";

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

    emitter.on(Events.QUEUE_READY, async (data) => {
        console.log(colors.gray(`Queue ready for guild ${data.guild_id} in channel ${data.channel_id}`));
    });

    emitter.on(Events.QUEUE_SYNC, async (data) => {
        console.log(colors.gray(`Queue synced for guild ${data.guild_id} in channel ${data.channel_id}`));
    });

    emitter.on(Events.QUEUE_PLAYER_ADD, async (data) => {
        console.log(colors.gray(`Player ${data.memberId} added to queue for guild ${data.guildId} in channel ${data.channelId}`));

        const worker = workers.find((w) => w.data.guild_id === data.guildId);
        if (!worker) return;

        const queue = await getQueue(data.guildId, data.channelId);
        if (!queue) return;

        await changeNickname(worker, String(queue.players.length) + "/2");
    });

    emitter.on(Events.QUEUE_PLAYER_REMOVE, async (data) => {
        console.log(colors.gray(`Player ${data.memberId} removed from queue for guild ${data.guildId} in channel ${data.channelId}`));

        const worker = workers.find((w) => w.data.guild_id === data.guildId);
        if (!worker) return;

        const queue = await getQueue(data.guildId, data.channelId);
        if (!queue) return;

        await changeNickname(worker, String(queue.players.length) + "/2");
    });

    emitter.on(Events.GAME_CREATE, async (data) => {
        console.log(colors.gray(`Game finished being created for guild ${data.guildId} with players ${data.team1Ids.map((id: string) => id).join(", ")} vs ${data.team2Ids.map((id: string) => id).join(", ")}`));
    });

    emitter.on(Events.GAME_FINISH, async (data) => {
        console.log(colors.gray(`Game finished for guild ${data.guildId} and game ${data.gameId}. Ready to score.`));
    });

    emitter.on(Events.GAME_VOID, async (data) => {
        console.log(colors.gray(`Game voided for guild ${data.guildId} and game ${data.gameId}`));

        const worker = workers.find((w) => w.data.guild_id === data.guildId);
        if (!worker) return console.log(colors.red("Unable to find worker suitable for this guild."));

        const queues = await getQueues(data.guildId);
        if (!queues || queues.length === 0) return console.log(colors.red("Unable to find queues suitable for this guild."));

        const embed = new EmbedBuilder()
            .setColor(discordColors.baseColor)
            .setTitle(`Game #${data.game.game_id} Voided`)
            .setDescription("**Team 1:** [" + data.game.team1_ids.map((id: string) => `<@${id}>`).join(", ") + "]\n**Team 2:** [" + data.game.team2_ids.map((id: string) => `<@${id}>`).join(", ") + "]")
            .setTimestamp();
        for (const queue of queues) {
            await sendMessageInChannel(worker, queue.game_channel_id, {
                embeds: [embed],
            });
        }
    });

    emitter.on(Events.GAME_SCORED, async (data) => {
        console.log(colors.gray(`Game scored for guild ${data.guildId} and game ${data.game.id}. Player 1 elo change: ${data.p1EloChange}. Player 2 elo change: ${data.p2EloChange}`));

        const worker = workers.find((w) => w.data.guild_id === data.guildId);
        if (!worker) return console.log(colors.red("Unable to find worker suitable for this guild."));

        const queues = await getQueues(data.guildId);
        if (!queues || queues.length === 0) return console.log(colors.red("Unable to find queues suitable for this guild."));

        const team1 = await Promise.all(data.game.team1_ids.map(async (id: string) => await getPlayer(data.guildId, id)));
        const team2 = await Promise.all(data.game.team2_ids.map(async (id: string) => await getPlayer(data.guildId, id)));

        const embed = new EmbedBuilder()
            .setColor(discordColors.baseColor)
            .setTitle(`Game #${data.game.game_id} Results`)
            .setDescription(
                "**Team 1:** [" +
                    data.game.team1_ids.map((id: string) => `<@${id}>`).join(", ") +
                    "]\n[`" +
                    (data.team1EloChange > 0 ? `+${Math.round(data.team1EloChange)} -> ${team1.map((p) => Math.round(p?.elo ?? 0)).join(", ")}` : `${Math.round(data.team1EloChange)} -> ${team1.map((p) => Math.round(p?.elo ?? 0)).join(", ")}`) +
                    "`]\n**Team 2:** [<@" +
                    data.game.team2_ids.map((id: string) => `<@${id}>`).join(", ") +
                    "]\n[`" +
                    (data.team2EloChange > 0 ? `+${Math.round(data.team2EloChange)} -> ${team2.map((p) => Math.round(p?.elo ?? 0)).join(", ")}` : `${Math.round(data.team2EloChange)} -> ${team2.map((p) => Math.round(p?.elo ?? 0)).join(", ")}`) +
                    "`]\n**Score:** `" +
                    data.team1Score +
                    "-" +
                    data.team2Score +
                    "`",
            )
            .setTimestamp();
        for (const queue of queues) {
            await sendMessageInChannel(worker, queue.game_channel_id, {
                embeds: [embed],
            });
        }
    });

    emitter.on(Events.DISCORD_READY, async () => {
        console.log(colors.green("Discord bot is ready!"));
    });

    emitter.on(Events.DISCORD_COMMAND_REGISTER, async (data) => {
        console.log(colors.gray(`Command registered: ${data.name}`));
    });

    emitter.on(Events.WORKER_FETCHED, async (data) => {
        console.log(colors.gray(`Worker fetched for guild ${data.guild_id} with client id ${data.id}`));
    });

    emitter.on(Events.WORKER_READY, async (data) => {
        console.log(colors.gray(`Worker ready for client id ${data.id}`));
    });

    emitter.on(Events.WORKER_COMMAND_REGISTER, async (data) => {
        console.log(colors.gray(`Command registered for worker: ${data.name}`));
    });
};
