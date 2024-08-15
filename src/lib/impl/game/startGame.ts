import { ChannelType, EmbedBuilder, Guild, PermissionsBitField } from "discord.js";
import { createGame } from "../../../database/impl/games/impl/create";
import { client, colors } from "../../../discord";
import emitter, { Events } from "../../../events";
import { getGameByGameId, getGames } from "../../../database/impl/games/impl/get";

export const startGame = async (guildId: string, player1: string, player2: string) => {
    const guild: Guild = await client.guilds.fetch(guildId);
    if (!guild) return;

    const gameId = (await getGames(guildId)).length + 1;

    const user1 = await guild.members.fetch(player1);
    const user2 = await guild.members.fetch(player2);

    if (!user1 || !user2) return;

    // Create text channel
    const textChannel = await guild.channels.create({
        name: `game-${gameId}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            {
                id: player1,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            {
                id: player2,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
        ],
    });

    const vc1 = await guild.channels.create({
        name: `Game ${gameId} Team 1`,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            },
            {
                id: player1,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            },
            {
                id: player2,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            },
        ],
    });

    const vc2 = await guild.channels.create({
        name: `Game ${gameId} Team 2`,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            },
            {
                id: player1,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            },
            {
                id: player2,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            },
        ],
    });

    await createGame(guild.id, gameId, player1, player2, {
        textChannel: textChannel.id,
        vc1: vc1.id,
        vc2: vc2.id,
    });

    const mainGameId = (await getGameByGameId(guildId, gameId))?.id;

    const channelEmbed = new EmbedBuilder().setColor(colors.baseColor).setTitle(`Game #${gameId}`).setDescription("Duel the other player using `/duel <user> bridge`. Once the game is done, send a screenshot of the score using `/score`. Remember, **games are best of 1**.").setTimestamp();
    await textChannel.send({ content: "<@" + player1 + "> <@" + player2 + ">", embeds: [channelEmbed] });
    await textChannel.send(`Game ID: \`${mainGameId}\``);

    await user1.voice.setChannel(vc1);
    await user2.voice.setChannel(vc2);

    await emitter.emit(Events.GAME_CREATE, {
        guildId: guild.id,
        gameId,
        player1,
        player2,
    });

    return gameId;
};
