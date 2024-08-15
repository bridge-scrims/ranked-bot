import { Guild, PermissionsBitField, TextChannel } from "discord.js";
import { client } from "../../../discord";
import { getGame } from "../../../database/impl/games/impl/get";
import emitter, { Events } from "../../../events";

export const closeChannel = async (guildId: string, gameId: string) => {
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
        await textChannelObj?.edit({
            name: `game-${game.game_id}-finished`,
        });

        await textChannelObj?.edit({
            permissionOverwrites: [
                {
                    id: game.player1_id,
                    deny: PermissionsBitField.Flags.ViewChannel,
                },
                {
                    id: game.player2_id,
                    deny: PermissionsBitField.Flags.ViewChannel,
                },
            ],
        });

        await (textChannelObj as TextChannel).send(`Player 1: \`${game.player1_id}\` - <@${game.player1_id}>\nPlayer 2: \`${game.player2_id}\` - <@${game.player2_id}>\n\nThe game has finished. GG! Score it via the \`/score-game\` command.`);

        await vc1Obj?.delete();
        await vc2Obj?.delete();
    } catch (e) {
        console.error(e);
    }

    await emitter.emit(Events.GAME_FINISH, {
        guildId,
        gameId,
    });

    return;
};
