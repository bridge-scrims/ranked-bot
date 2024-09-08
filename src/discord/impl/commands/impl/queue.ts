import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction } from "discord.js";
import { getQueue } from "../../../../database/impl/queues/impl/get";
import { colors } from "../../..";
import { add } from "../../../../lib/impl/queue/add";
import { exists } from "../../../../lib/impl/queue/exists";
import { remove } from "../../../../lib/impl/queue/remove";

export default {
    name: "queue",
    description: "Joins a queue without joining the VC.",
    options: [
        {
            name: "channel",
            description: "The channel to queue.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.options.get("channel");
            if (!channel || !channel.channel) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Could not find that channel! Please provide a valid voice channel.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                const data = await getQueue(interaction.guildId ?? "", channel?.channel?.id ?? "");
                if (!data) {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`No queue data found for <#${channel?.channel?.id}>. Please provide a valid voice channel.`);
                    return interaction.editReply({ embeds: [embed] });
                }

                if (await exists(interaction.guildId ?? "", channel?.channel?.id ?? "", interaction.user.id)) {
                    await remove(interaction.guildId ?? "", channel?.channel?.id ?? "", interaction.user.id);

                    const embed = new EmbedBuilder().setColor(colors.successColor).setDescription(`Successfully removed you from the queue for <#${channel?.channel?.id}>.`);
                    return interaction.editReply({ embeds: [embed] });
                }

                await add(interaction.guildId ?? "", channel?.channel?.id ?? "", interaction.user.id);

                const embed = new EmbedBuilder().setColor(colors.successColor).setDescription(`Successfully added you to the queue for <#${channel?.channel?.id}>.`);
                return interaction.editReply({ embeds: [embed] });
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
