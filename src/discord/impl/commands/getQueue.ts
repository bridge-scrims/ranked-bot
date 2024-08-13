import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { getQueue } from "../../../database/impl/queues/impl/get";
import { colors } from "../..";

export default {
    name: "get-queue",
    description: "Gets a queue's information.",
    options: [
        {
            name: "channel",
            description: "The channel to get information about.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.options.get("channel");
            if (!channel || !channel.channel) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Could not find that channel! Create a queue via `/create-queue`.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                const data = await getQueue(interaction.guildId ?? "", channel?.channel?.id ?? "");
                if (!data) {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`No queue data found for <#${channel?.channel?.id}>.`);
                    return interaction.editReply({ embeds: [embed] });
                }

                return interaction.editReply("asdifiaowihoerohiuaewr");
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while creating the queue.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
