import { DEFAULT_RANGE } from "../..";
import { getQueue } from "../../../database/impl/queues/impl/get";
import { PlayerQueue } from "../../../types";
import { startGame } from "../game/startGame";
import { remove } from "./remove";

const skips: { playerId: string; skips: number }[] = [];
const processedGames = new Set<string>();

const matchPlayers = async (guildId: string, channelId: string) => {
    const queue = await getQueue(guildId, channelId);
    let players: PlayerQueue[] =
        queue?.players.map((p) => {
            return {
                ...p,
                skips: skips.find((s) => s.playerId === p.user_id)?.skips ?? 0,
                matched: false,
            };
        }) || [];

    if (players.length < 2) return;

    // Sort players by ELO
    players.sort((a, b) => a.elo - b.elo);

    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.matched) continue;

        const match = findClosestMatch(players, i);

        if (match) {
            player.matched = true;
            match.matched = true;

            await startMatchedGame(guildId, channelId, player, match);

            players = players.filter((p) => p.user_id !== player.user_id && p.user_id !== match.user_id);
            i--;

            setTimeout(() => {
                const gameKey = `${Math.min(Number(player.user_id), Number(match.user_id))}-${Math.max(Number(player.user_id), Number(match.user_id))}`;
                processedGames.delete(gameKey);
            }, 1000);
        } else {
            // Expand the range for this player and increment skips
            player.skips++;

            const playerSkips = skips.find((s) => s.playerId === player.user_id);
            if (playerSkips) {
                playerSkips.skips++;
            } else {
                skips.push({ playerId: player.user_id, skips: 1 });
            }
        }
    }

    players = players.filter((p) => !p.matched);
};

const findClosestMatch = (players: PlayerQueue[], currentIndex: number): PlayerQueue | null => {
    const current = players[currentIndex];
    const rangeIncrement = DEFAULT_RANGE + current.skips * 5;
    let closestMatch: PlayerQueue | null = null;
    let minDifference = Infinity;

    for (let i = 0; i < players.length; i++) {
        if (i === currentIndex || players[i].matched) continue;

        const potentialMatch = players[i];
        const eloDifference = Math.abs(current.elo - potentialMatch.elo);

        if (eloDifference <= rangeIncrement && eloDifference < minDifference) {
            minDifference = eloDifference;
            closestMatch = potentialMatch;
        }
    }

    return closestMatch;
};

const startMatchedGame = async (guildId: string, channelId: string, player1: PlayerQueue, player2: PlayerQueue) => {
    const gameKey = `${Math.min(Number(player1.user_id), Number(player2.user_id))}-${Math.max(Number(player1.user_id), Number(player2.user_id))}`;
    if (processedGames.has(gameKey)) {
        //console.log(`Game between ${player1.user_id} and ${player2.user_id} already processed.`);
        return;
    }

    processedGames.add(gameKey);

    await remove(guildId, channelId, player1.user_id);
    await remove(guildId, channelId, player2.user_id);
    await startGame(guildId, [player1.user_id], [player2.user_id]);

    skips.splice(
        skips.findIndex((s) => s.playerId === player1.user_id),
        1,
    );
    skips.splice(
        skips.findIndex((s) => s.playerId === player2.user_id),
        1,
    );
};

export const interval = (guildId: string, channelId: string) => {
    setInterval(() => matchPlayers(guildId, channelId), 2000);
};
