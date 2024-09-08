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
                ...game.team1_ids.map((id: string) => ({
                    id,
                    deny: PermissionsBitField.Flags.ViewChannel,
                })),
                ...game.team2_ids.map((id: string) => ({
                    id,
                    deny: PermissionsBitField.Flags.ViewChannel,
                })),
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
            ],
        });

        await (textChannelObj as TextChannel).send(
            `Team 1: ${game.team1_ids
                .map((id) => {
                    return `<@${id}>`;
                })
                .join(", ")}\nTeam 2: ${game.team2_ids
                .map((id) => {
                    return `<@${id}>`;
                })
                .join(", ")}\n\nThe game has finished. Please score it via the \`/score-game\` command.`,
        );

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
