import { Game } from "@/database/models/Game"
import { client, colors } from "@/discord"
import { stringifyScore } from "@/util/scores"
import {
    bold,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    OverwriteType,
    PermissionFlagsBits,
    Routes,
    userMention,
    type OverwriteResolvable,
} from "discord.js"
import { MessageOptionsBuilder } from "../discord/MessageOptionsBuilder"

export async function closeChannel(game: Game, score1: number, score2: number, image?: string) {
    const guild = await client.guilds.fetch(game.guildId!)
    if (!guild) return

    const update = await Game.updateOne({ _id: game.id }, { $unset: { channels: "" } })
    if (!update.modifiedCount) return false

    const embed = new EmbedBuilder()
        .setTitle(`Game ${game.sequence} Finished`)
        .setDescription(
            `The game has finished.\nPlease confirm ${bold(stringifyScore(game, score1, score2))} ` +
                `or overwrite it with the /score-game command.`,
        )
        .setColor(colors.baseColor)
        .setImage(image ?? null)
        .setFields(
            game.teams.map((v, i) => ({
                name: `Team ${i + 1}`,
                value: v.players.map((v) => `- ${userMention(v)}`).join("\n"),
            })),
        )

    const button = new ButtonBuilder()
        .setLabel("Score Game")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`confirmScore:${score1}:${score2}`)

    Promise.allSettled(game.channels!.map((id) => client.rest.delete(Routes.channel(id))))

    const message = new MessageOptionsBuilder().addEmbeds(embed).addButtons(button)
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
        await text.edit({ name: `finished-${text.name}`, permissionOverwrites })
        await text.send(message)
    }

    return true
}
