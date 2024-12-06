import {
    ChannelType,
    InteractionContextType,
    REST,
    Routes,
    SlashCommandBuilder,
    type APIUser,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Queue } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { encrypt } from "@/util/encryption"

const Options = {
    Channel: "channel",
    TextCategory: "text-category",
    VcCategory: "vc-category",
    QueueLog: "queue-log",
    GameLog: "game-log",
    Token: "token",
}

export default {
    builder: new SlashCommandBuilder()
        .setName("create-queue")
        .setDescription("Creates a queue for the current guild.")
        .addChannelOption((option) =>
            option
                .setName(Options.Channel)
                .addChannelTypes(ChannelType.GuildVoice)
                .setDescription("The channel to create the queue in.")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName(Options.TextCategory)
                .addChannelTypes(ChannelType.GuildCategory)
                .setDescription("The category to put the game channels in.")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName(Options.VcCategory)
                .addChannelTypes(ChannelType.GuildCategory)
                .setDescription("The category to put the team calls in.")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName(Options.QueueLog)
                .addChannelTypes(ChannelType.GuildText)
                .setDescription("The channel to post the queue log in.")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName(Options.GameLog)
                .addChannelTypes(ChannelType.GuildText)
                .setDescription("The channel to post games in.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName(Options.Token).setDescription("The client token of the worker.").setRequired(true),
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions("0"),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const voice = interaction.options.getChannel(Options.Channel, true)
        const textCategory = interaction.options.getChannel(Options.TextCategory, true)
        const vcCategory = interaction.options.getChannel(Options.VcCategory, true)
        const queueLog = interaction.options.getChannel(Options.QueueLog, true)
        const gameLog = interaction.options.getChannel(Options.GameLog, true)
        const token = interaction.options.getString(Options.Token, true)

        let clientId: string
        try {
            const rest = new REST().setToken(token)
            const client = (await rest.get(Routes.user())) as APIUser
            clientId = client.id
        } catch {
            throw new UserError("Invalid client token!")
        }

        await Queue.create({
            _id: voice.id,
            guildId: interaction.guildId!,
            textCategory: textCategory.id,
            vcCategory: vcCategory.id,
            queueLog: queueLog.id,
            gameLog: gameLog.id,
            workerId: clientId,
            token: encrypt(token),
        })

        return `Queue created successfully in ${voice}.`
    },
}
