import { Guild } from "discord.js";
import { client } from "../../../discord";
import { getGame } from "../../../database/impl/games/impl/get";
import { updateGame } from "../../../database/impl/games/impl/update";
import emitter, { Events } from "../../../events";

export const voidGame = async (guildId: string, gameId: string) => {
    const guild: Guild = await client.guilds.fetch(guildId);
    const game = await getGame(guildId, gameId);
    if (!guild || !game) return;

    const channels = game.channel_ids;
    const textChannel = channels.textChannel;
    const vc1 = channels.vc1;
    const vc2 = channels.vc2;

    const textChannelObj = await guild.channels.fetch(textChannel);
    const vc1Obj = await guild.channels.fetch(vc1);
    const vc2Obj = await guild.channels.fetch(vc2);

    try {
        await textChannelObj?.delete();
        await vc1Obj?.delete();
        await vc2Obj?.delete();
    } catch (e) {
        console.error(e);
    }

    // Update game in database
    await updateGame(guildId, gameId, {
        player1_score: -1,
        player2_score: -1,
    });

    await emitter.emit(Events.GAME_VOID, { guildId, gameId, data: { player1_score: -1, player2_score: -1 } });

    return;
};
