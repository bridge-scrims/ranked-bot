import { ChannelType, EmbedBuilder, Guild, PermissionsBitField } from "discord.js";
import { createGame } from "../../../database/impl/games/impl/create";
import { client, colors } from "../../../discord";
import emitter, { Events } from "../../../events";
import { getGameByGameId, getGames } from "../../../database/impl/games/impl/get";

export const startGame = async (guildId: string, team1Ids: string[], team2Ids: string[]) => {
    const guild: Guild = await client.guilds.fetch(guildId);
    if (!guild) return;

    const gameId = (await getGames(guildId)).length + 1;

    const team1 = await Promise.all(team1Ids.map(async (id) => await guild.members.fetch(id)));
    const team2 = await Promise.all(team2Ids.map(async (id) => await guild.members.fetch(id)));

    // Create text channel
    const textChannel = await guild.channels.create({
        name: `game-${gameId}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            ...team1.map((member) => ({
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            })),
            ...team2.map((member) => ({
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            })),
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
            ...team1.map((member) => ({
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            })),
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
            ...team2.map((member) => ({
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
            })),
        ],
    });

    await createGame(guild.id, gameId, team1Ids, team2Ids, {
        textChannel: textChannel.id,
        vc1: vc1.id,
        vc2: vc2.id,
    });

    const mainGameId = (await getGameByGameId(guildId, gameId))?.id;

    const channelEmbed = new EmbedBuilder().setColor(colors.baseColor).setTitle(`Game #${gameId}`).setDescription("Duel the other player using `/duel <user> bridge`. Once the game is done, send a screenshot of the score using `/score`. Remember, **games are best of 1**.").setTimestamp();
    //await textChannel.send({ content: "<@" + player1 + "> <@" + player2 + ">", embeds: [channelEmbed] });
    await textChannel.send({ content: team1Ids.map((id) => `<@${id}>`).join(" ") + " " + team2Ids.map((id) => `<@${id}>`).join(" "), embeds: [channelEmbed] });
    await textChannel.send(`Game ID: \`${mainGameId}\``);

    for (const member of team1) {
        try {
            await member.voice.setChannel(vc1);
        } catch {
            // User is not in a voice channel
        }
    }

    for (const member of team2) {
        try {
            await member.voice.setChannel(vc2);
        } catch {
            // User is not in a voice channel
        }
    }

    await emitter.emit(Events.GAME_CREATE, {
        guildId: guild.id,
        gameId,
        team1Ids,
        team2Ids,
    });

    return gameId;
};
