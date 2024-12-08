import { Game } from "@/database/models/Game"
import { client, colors } from "@/discord"
import {
    EmbedBuilder,
    OverwriteType,
    PermissionFlagsBits,
    Routes,
    userMention,
    type MessageCreateOptions,
    type OverwriteResolvable,
} from "discord.js"

export async function closeChannel(game: Game, image?: string) {
    const guild = await client.guilds.fetch(game.guildId!)
    if (!guild) return

    const update = await Game.updateOne({ _id: game.id }, { $unset: { channels: "" } })
    if (!update.modifiedCount) return false

    const embed = new EmbedBuilder()
        .setTitle(`Game ${game.sequence} Finished`)
        .setDescription(`The game has finished. Please score it via the \`/score-game\` command.`)
        .setColor(colors.baseColor)
        .setImage(image ?? null)
        .setFields(
            game.teams.map((v, i) => ({
                name: `Team ${i + 1}`,
                value: v.players.map((v) => `- ${userMention(v)}`).join("\n"),
            })),
        )

    Promise.allSettled(game.channels!.map((id) => client.rest.delete(Routes.channel(id))))

    const message: MessageCreateOptions = { embeds: [embed] }
    const permissionOverwrites: OverwriteResolvable[] = [
        {
            id: guild.roles.everyone.id,
            type: OverwriteType.Role,
            deny: [PermissionFlagsBits.ViewChannel],
        },
    ]

    const scorer = guild.roles.cache.find((v) => v.name.toLowerCase() === "scorer")
    if (scorer) {
        message.content = scorer.toString()
        permissionOverwrites.push({
            id: scorer.id,
            type: OverwriteType.Role,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.SendMessages,
            ],
        })
    }

    const text = await guild.channels.fetch(game.id)
    if (text?.isSendable()) {
        await Promise.all([
            text.edit({ name: `finished-${text.name}`, permissionOverwrites }),
            text.send(message),
        ])
    }

    return true
}
