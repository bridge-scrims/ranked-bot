import {
    ChannelType,
    EmbedBuilder,
    Guild,
    OverwriteType,
    PermissionFlagsBits,
    PermissionsBitField,
    type GuildBasedChannel,
    type GuildChannelTypes,
    type GuildMember,
} from "discord.js"

import type { Queue } from "@/database"
import { client, colors } from "@/discord"
import { createGame, incrementSequence } from "."
import { mergePermissions } from "../discord/mergePermissions"

const PERMISSIONS = new PermissionsBitField([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.AddReactions,
])

export async function startGame(queue: Queue, teams: string[][]) {
    const guild = await client.guilds.fetch(queue.guildId)
    if (!guild) return

    const gameId = await incrementSequence()
    const teamMembers = await Promise.all(
        teams.map((members) => Promise.all(members.map((v) => guild.members.fetch(v)))),
    )
    const members = teamMembers.flatMap((v) => v)

    const textCategory = guild.channels.cache.get(queue.textCategory)
    const vcCategory = guild.channels.cache.get(queue.vcCategory)

    const [text, vcs] = await Promise.all([
        createChannel(queue, `game-${gameId}`, ChannelType.GuildText, guild, members, textCategory),
        Promise.all(
            teamMembers.map((v, i) =>
                createChannel(
                    queue,
                    `Game ${gameId} Team ${i + 1}`,
                    ChannelType.GuildVoice,
                    guild,
                    v,
                    vcCategory,
                ),
            ),
        ),
    ])

    await createGame({
        _id: text.id,
        sequence: gameId,
        guildId: guild.id,
        queueId: queue.id,
        teams: teams.map((players) => ({ players })),
        channels: vcs.map((v) => v.id),
    })

    for (const team of teamMembers) {
        const vc = vcs.shift()!
        for (const member of team) {
            member.voice.setChannel(vc).catch(() => null)
        }
    }

    const embed = new EmbedBuilder()
        .setColor(colors.baseColor)
        .setTitle(`Game #${gameId}`)
        .setDescription(
            "Duel the other player using `/duel <user> bridge`. " +
                "Once the game is done, send a screenshot of the score using `/score`. " +
                "Remember, **games are best of 1**.",
        )
        .setTimestamp()

    await text.send({
        content: members.flatMap((v) => v).join(" "),
        embeds: [embed],
    })

    return gameId
}

async function createChannel<T extends GuildChannelTypes>(
    queue: Queue,
    name: string,
    type: T,
    guild: Guild,
    team: GuildMember[],
    parent?: GuildBasedChannel,
) {
    const permissions = mergePermissions(
        parent?.type === ChannelType.GuildCategory ? parent.permissionOverwrites.cache : null,
        [
            {
                id: guild.roles.everyone.id,
                type: OverwriteType.Role,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: queue.workerId,
                type: OverwriteType.Member,
                allow: PERMISSIONS,
            },
            ...team.map((p) => ({
                id: p.id,
                type: OverwriteType.Member,
                allow: PERMISSIONS,
            })),
        ],
    )

    return guild.channels.create({
        name,
        type,
        parent: parent?.id,
        permissionOverwrites: permissions,
    })
}
