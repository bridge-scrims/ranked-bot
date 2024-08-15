import { ranking } from "../..";
import { getPlayer } from "../../../database/impl/players/impl/get";
import { updatePlayer } from "../../../database/impl/players/impl/update";
import { client } from "../../../discord";
import emitter, { Events } from "../../../events";
import { Game } from "../../../types";
import { Player } from "glicko2";

export const scoreGame = async (guildId: string, game: Game, player1Score: number, player2Score: number) => {
    const guild = await client.guilds.fetch(guildId);

    const p1 = await getPlayer(guildId, game.player1_id);
    const p2 = await getPlayer(guildId, game.player2_id);

    if (!p1 || !p2) return;

    const p1Ranking = ranking.makePlayer(p1?.elo ?? 1000);
    const p2Ranking = ranking.makePlayer(p2?.elo ?? 1000);

    const matches: [Player, Player, number][] = [
        [p1Ranking, p2Ranking, player1Score > player2Score ? 1 : 0],
        [p2Ranking, p1Ranking, player2Score > player1Score ? 1 : 0],
    ];

    ranking.updateRatings(matches);

    const p1Elo = p1Ranking.getRating();
    const p2Elo = p2Ranking.getRating();

    const p1EloChange = p1Elo - (p1?.elo ?? 1000);
    const p2EloChange = p2Elo - (p2?.elo ?? 1000);

    const p1Update = p1EloChange > 0 ? p1Elo + player1Score / 4 : p1Elo + player1Score;
    const p2Update = p2EloChange > 0 ? p2Elo + player2Score / 4 : p2Elo + player2Score;

    await updatePlayer(guildId, p1.id, {
        elo: p1Update,
        wins: player1Score > player2Score ? p1.wins + 1 : p1.wins,
        losses: player1Score < player2Score ? p1.losses + 1 : p1.losses,
        win_streak: player1Score > player2Score ? p1.win_streak + 1 : 0,
        best_win_streak: player1Score > player2Score ? Math.max(p1.win_streak + 1, p1.best_win_streak) : p1.best_win_streak,
    });

    await updatePlayer(guildId, p2.id, {
        elo: p2Update,
        wins: player2Score > player1Score ? p2.wins + 1 : p2.wins,
        losses: player2Score < player1Score ? p2.losses + 1 : p2.losses,
        win_streak: player2Score > player1Score ? p2.win_streak + 1 : 0,
        best_win_streak: player2Score > player1Score ? Math.max(p2.win_streak + 1, p2.best_win_streak) : p2.best_win_streak,
    });

    await emitter.emit(Events.GAME_SCORED, { guildId, game, player1Score, player2Score, p1EloChange, p2EloChange });

    await guild.channels.cache.get(game.channel_ids.textChannel)?.delete();
};
