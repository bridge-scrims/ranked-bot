import { Stats } from "@/Constants"
import { Player } from "@/database"
import { MessageOptionsBuilder } from "@/lib/discord/MessageOptionsBuilder"
import { UserError } from "@/lib/discord/UserError"
import {
    bold,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    inlineCode,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    userMention,
    type ChatInputCommandInteraction,
} from "discord.js"
import { colors } from ".."

const Types = {
    Elo: "ELO",
    Wins: "Wins",
    BestStreak: "Best Win Streak",
}

const Fields = {
    [Types.Elo]: Stats.Elo,
    [Types.Wins]: Stats.Wins,
    [Types.BestStreak]: Stats.BestStreak,
}

const PAGE = 15

export default {
    builder: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Displays the current Ranked Bridge leaderboard.")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of leaderboard to display")
                .setChoices(Object.values(Types).map((v) => ({ name: v, value: v })))
                .setRequired(false),
        )
        .addIntegerOption((option) =>
            option
                .setName("page")
                .setDescription("The page of the leaderboard to display")
                .setMinValue(1)
                .setRequired(false),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const type = interaction.options.getString("type") ?? Types.Elo
        const page = interaction.options.getInteger("page") ?? 1

        const leaderboard = await getLeaderboard(type, page)
        await interaction.reply(leaderboard)
    },
}

export async function getLeaderboard(type: string, page: number) {
    const skip = (page - 1) * PAGE
    const field = Fields[type]!
    const leaderboard = await Player.find(
        { [field]: { $exists: true } },
        { [field]: 1 },
        { sort: { [field]: -1 }, skip: skip, limit: PAGE + 1 },
    )

    if (!leaderboard.length) throw new UserError(`No players found on page ${page}.`)

    const embed = new EmbedBuilder()
        .setTitle(`Ranked Leaderboard | ${type}`)
        .setColor(colors.baseColor)
        .setFooter({ text: `Page ${page}` })
        .setTimestamp()

    const split = field.split(".")
    embed.setDescription(
        leaderboard
            .map((v, i) => {
                const val = split.reduce((pv, cv) => pv[cv], v as any)
                return `${bold(`${i + 1 + skip}.`)} ${userMention(v.id)} ${inlineCode(val)}`
            })
            .join("\n"),
    )

    return new MessageOptionsBuilder()
        .addEmbeds(embed)
        .addActions(
            new StringSelectMenuBuilder()
                .setCustomId(`leaderboard:${page}`)
                .setMinValues(1)
                .setMaxValues(1)
                .setOptions(Object.values(Types).map((v) => ({ label: v, value: v, default: v === type }))),
        )
        .addButtons(
            new ButtonBuilder()
                .setCustomId(`leaderboard:${type}:${page - 1}`)
                .setLabel("Previous Page")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`leaderboard:${type}:${page + 1}`)
                .setLabel("Next Page")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(leaderboard.length <= PAGE),
        )
}
