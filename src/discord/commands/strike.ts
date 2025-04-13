import { SEASON } from "@/Constants"
import { Strike } from "@/database/models/Strike"
import { MessageOptionsBuilder } from "@/lib/discord/MessageOptionsBuilder"
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    time,
    userMention,
} from "discord.js"

export default {
    builder: new SlashCommandBuilder()
        .setName("strike")
        .setDescription("Manage Ranked Bridge strikes.")
        .addSubcommand(buildAddSubcommand())
        .addSubcommand(buildListSubcommand())
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions("0"),

    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        switch (interaction.options.getSubcommand()) {
            case "add": {
                const user = interaction.options.getUser("user", true)
                const reason = interaction.options.getString("reason") || undefined

                await Strike.create({
                    executorId: interaction.user.id,
                    reason,
                    season: SEASON,
                    userId: user.id,
                })

                const dm =
                    `**You have been given a strike in Ranked Bridge (${SEASON})**` +
                    (reason ? ` for *${reason}*.` : ".")
                user.send(dm).catch(() => null)

                return `Successfully added a strike to ${user}.`
            }

            case "list": {
                const user = interaction.options.getUser("user", true)
                const season = interaction.options.getString("season") || SEASON

                const strikes = await Strike.find({ userId: user.id, season }, null, { sort: { givenAt: 1 } })
                if (strikes.length === 0) return `${user} has no strikes in season ${season}.`

                return new MessageOptionsBuilder().createMultipleEmbeds(strikes, (strikes, _, offset) =>
                    new EmbedBuilder()
                        .setTitle(`Ranked Strikes | ${season}`)
                        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
                        .setColor(0xb01a32)
                        .setFields(
                            strikes.map((strike, index) => ({
                                name: `${offset + index + 1}. Strike | **${time(strike.givenAt, "D")}**`,
                                value:
                                    `Given by ${userMention(strike.executorId)}` +
                                    (strike.reason ? ` for *${strike.reason}*.` : "."),
                            })),
                        ),
                )
            }
        }
    },
}

function buildAddSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a strike to a user.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to add a strike to.").setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for the strike.").setRequired(false),
        )
}

function buildListSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("List all strikes for a user.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to list strikes for.").setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("season")
                .setDescription("The season to list strikes for (Default: current).")
                .setRequired(false),
        )
}
