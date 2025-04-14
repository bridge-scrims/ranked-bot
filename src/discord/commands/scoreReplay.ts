import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Player } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { getGame } from "@/lib/game"
import { scoreGame } from "@/lib/game/scoreGame"
import { fetchGame } from "@/lib/minecraft/scrims"

export default {
    builder: new SlashCommandBuilder()
        .setName("score")
        .setDescription("Scores the game using a replay link.")
        .addStringOption((option) =>
            option.setName("replay").setDescription("The replay link of the game.").setRequired(true),
        )
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const game = await getGame(interaction.channelId)
        if (!game) throw new UserError("This command can only be used in game channels!")

        if (!interaction.channel!.isSendable())
            throw new Error(`Invalid game channel type ${interaction.channel!.type}`)

        const replay = interaction.options.getString("replay", true)
        const id = replay.startsWith("/replay") ? replay.slice(8) : replay
        const data = await fetchGame(id).catch(() => {
            throw new UserError(
                "Game data is currently unavailable please use **/score-screenshot**" +
                    " with a screenshot of the game results instead.",
            )
        })

        if (!data) throw new UserError("Invalid replay link or game ID.")
        if (data.gameType !== "BRIDGE" || data.mode !== "DUEL")
            throw new UserError("Games must be a **Bridge Duel**.")

        if (data.duration < 60 * 1000)
            throw new UserError(
                "Game must be above one minute in length to auto score it." +
                    " Use **/score-screenshot** if the game was actually under one minute.",
            )

        if (data.teams.length !== game.teams.length)
            throw new UserError("Number of teams in the replay does not match.")

        await Player.cacheInitialized()
        const teams = Object.fromEntries(data.teams.map((v) => [v.name, v]))
        const pTeams = Object.fromEntries(
            data.teams.flatMap((t) => t.players.map((id) => [Player.resolveMcUuid(id)!, t.name])),
        )

        if (game.teams.flatMap((t) => t).length !== Object.keys(pTeams).length)
            throw new UserError("Number of players in the replay does not match.")

        if (!game.teams.every((t) => t.every((id) => id in pTeams)))
            throw new UserError("Players in the replay do not match the players of this game.")

        if (!game.teams.every((t) => new Set(t.map((id) => pTeams[id])).size === 1))
            throw new UserError("Teams in the replay do not match the teams of this game.")

        if (data.timestamp < game.date.valueOf())
            throw new UserError("Replay must be from after you queued this game.")

        const orderedTeams = game.teams.map((t) => teams[pTeams[t[0]!]!]!)

        if (data.winner === "") {
            game.winner = -1
        } else {
            const winner = orderedTeams.findIndex((team) => team.name === data.winner)
            if (winner === -1) throw new Error(`Invalid winner for ${data._id}`)

            game.winner = winner
        }

        game.scores = orderedTeams.map((team) => team.goals)
        game.meta = { replay: id, duration: data.duration, map: data.map }
        await scoreGame(game)

        return "Game scored."
    },
}
