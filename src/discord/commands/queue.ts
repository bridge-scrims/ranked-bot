import {
    ChannelType,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type BaseGuildVoiceChannel,
    type ChatInputCommandInteraction,
} from "discord.js"

import { Queue } from "@/database"
import { UserError } from "@/lib/discord/UserError"
import { addToQueue, QueueResult, removeParticipantFromQueue } from "@/lib/queue"

const guildQueues: Record<string, Queue> = {}
function indexGuildQueues() {
    Object.keys(guildQueues).forEach((key) => delete guildQueues[key])

    const guilds = new Set<string>()
    for (const queue of Queue.cache.values()) {
        if (guilds.has(queue.guildId)) {
            delete guildQueues[queue.guildId]
        } else {
            guilds.add(queue.guildId)
            guildQueues[queue.guildId] = queue
        }
    }
}

Queue.cache.on("add", () => indexGuildQueues())
Queue.cache.on("delete", () => indexGuildQueues())

export default {
    builder: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Joins/Leaves a queue without joining the VC.")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .addChannelTypes(ChannelType.GuildVoice)
                .setDescription("The channel to queue.")
                .setRequired(false),
        )
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),

    async execute(interaction: ChatInputCommandInteraction<undefined>) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const oldQueue = removeParticipantFromQueue(interaction.user.id)
        if (oldQueue === false) {
            throw new UserError("Only the party leader can queue the party.")
        } else if (oldQueue) {
            return `Successfully removed you from ${oldQueue}`
        }

        const queue = resolveQueue(interaction)
        const result = await addToQueue(queue, interaction.user.id)
        switch (result) {
            case QueueResult.NotRegistered:
                throw new UserError("You must use /register first to use the ranked queue.")
            case QueueResult.NotLeader:
                throw new UserError("Only the party leader can queue the party.")
            case QueueResult.NoAccess:
                throw new UserError("You or someone in your party doesn't have access to this queue.")
            case QueueResult.TooBig:
                throw new UserError("Your party is too big for this queue.")
            case QueueResult.OnCooldown:
                throw new UserError("You must wait 1 minute between queueing a game and requeuing.")
            case QueueResult.AlreadyQueued:
                throw new UserError(`You are already in the ${queue} queue.`)
        }

        return `Added you to the queue for ${queue}`
    },
}

function resolveQueue(interaction: ChatInputCommandInteraction<undefined>) {
    const channel = interaction.options.getChannel("channel") as BaseGuildVoiceChannel | null
    if (channel) {
        const queue = Queue.cache.get(channel.id)
        if (!queue) throw new UserError(`${channel} is not a queue channel!`)
        return queue
    }

    if (interaction.guildId && interaction.guildId in guildQueues) {
        return guildQueues[interaction.guildId]!
    }

    if (Queue.cache.size === 1) {
        return Queue.cache.values().next().value!
    }

    throw new UserError("You must specify the queue channel you want to join.")
}
