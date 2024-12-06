import { Game } from "@/database/models/Game"
import { client } from "@/discord"
import { EmbedBuilder, OverwriteType, PermissionsBitField, Routes, userMention } from "discord.js"

export async function closeChannel(game: Game) {
    const guild = await client.guilds.fetch(game.guildId!)
    if (!guild) return

    const update = await Game.updateOne({ _id: game.id }, { $unset: { channels: "" } })
    if (!update.modifiedCount) return false

    const embed = new EmbedBuilder()
        .setTitle(`Game ${game.sequence} Finished`)
        .setDescription(`The game has finished. Please score it via the \`/score-game\` command.`)
        .setFields(
            game.teams.map((v, i) => ({
                name: `Team ${i + 1}`,
                value: v.players.map((v) => `- ${userMention(v)}`).join("\n"),
            })),
        )

    Promise.allSettled(game.channels!.map((id) => client.rest.delete(Routes.channel(id))))

    const text = await guild.channels.fetch(game.id)
    if (text?.isSendable()) {
        await Promise.all([
            text.edit({
                name: `finished-${text.name}`,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        type: OverwriteType.Role,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            }),
            text.send({ embeds: [embed] }),
        ])
    }

    return true
}
