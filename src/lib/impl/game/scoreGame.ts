import { ranking } from "../..";
import { updateGame } from "../../../database/impl/games/impl/update";
import { getPlayer } from "../../../database/impl/players/impl/get";
import { updatePlayer } from "../../../database/impl/players/impl/update";
import { client } from "../../../discord";
import emitter, { Events } from "../../../events";
import { Game } from "../../../types";
import { Player } from "glicko2";

export const scoreGame = async (guildId: string, game: Game, team1Score: number, team2Score: number) => {
    const guild = await client.guilds.fetch(guildId);

    const team1 = await Promise.all(game.team1_ids.map(async (id) => await getPlayer(guildId, id)));
    const team2 = await Promise.all(game.team2_ids.map(async (id) => await getPlayer(guildId, id)));

    const team1AverageELO = team1.reduce((acc, player) => acc + (player?.elo ?? 0), 0) / team1.length;
    const team2AverageELO = team2.reduce((acc, player) => acc + (player?.elo ?? 0), 0) / team2.length;

    console.log(`Team 1 average ELO: ${team1AverageELO}`);
    console.log(`Team 2 average ELO: ${team2AverageELO}`);

    const team1Ranking = ranking.makePlayer(team1AverageELO ?? 1000);
    const team2Ranking = ranking.makePlayer(team2AverageELO ?? 1000);

    const matches: [Player, Player, number][] = [
        [team1Ranking, team2Ranking, team1Score > team2Score ? 1 : 0],
        [team2Ranking, team1Ranking, team2Score > team1Score ? 1 : 0],
    ];

    ranking.updateRatings(matches);

    const team1Elo = team1Ranking.getRating();
    const team2Elo = team2Ranking.getRating();

    const team1EloChange = team1Elo - (team1AverageELO ?? 1000);
    const team2EloChange = team2Elo - (team2AverageELO ?? 1000);

    const team1Update = team1EloChange > 0 ? team1Elo + team1Score / 4 : team1Elo + team1Score;
    const team2Update = team2EloChange > 0 ? team2Elo + team2Score / 4 : team2Elo + team2Score;

    await updateGame(guildId, game.id, {
        team1_score: team1Score,
        team2_score: team2Score,
    });

    for (const player of team1) {
        if (!player) continue;
        await updatePlayer(guildId, player.id, {
            elo: team1Update,
            wins: team1Score > team2Score ? player.wins + 1 : player.wins,
            losses: team1Score < team2Score ? player.losses + 1 : player.losses,
            win_streak: team1Score > team2Score ? player.win_streak + 1 : 0,
            best_win_streak: team1Score > team2Score ? Math.max(player.win_streak + 1, player.best_win_streak) : player.best_win_streak,
        });
    }

    for (const player of team2) {
        if (!player) continue;
        await updatePlayer(guildId, player.id, {
            elo: team2Update,
            wins: team2Score > team1Score ? player.wins + 1 : player.wins,
            losses: team2Score < team1Score ? player.losses + 1 : player.losses,
            win_streak: team2Score > team1Score ? player.win_streak + 1 : 0,
            best_win_streak: team2Score > team1Score ? Math.max(player.win_streak + 1, player.best_win_streak) : player.best_win_streak,
        });
    }

    await emitter.emit(Events.GAME_SCORED, { guildId, game, team1Score, team2Score, team1EloChange, team2EloChange });

    await guild.channels.cache.get(game.channel_ids.textChannel)?.delete();
};
