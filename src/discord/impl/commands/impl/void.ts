import { ActionRowBuilder, ApplicationCommandDataResolvable, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../../..";
import { getGameByChannelId } from "../../../../database/impl/games/impl/get";

export default {
    name: "void",
    description: "Voids a game.",
    options: [],
    defaultMemberPermissions: PermissionFlagsBits.UseApplicationCommands,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const game = await getGameByChannelId(interaction.guildId ?? "", interaction.channelId, "textChannel");
            if (!game) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You can only void the game in the game channel.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                if (game?.team1_ids.includes(interaction.user.id) || game?.team2_ids.includes(interaction.user.id)) {
                    const otherTeam = game.team1_ids.includes(interaction.user.id) ? game.team2_ids : game.team1_ids;
                    const voidEmbed = new EmbedBuilder().setColor(colors.baseColor).setTitle("Void Request").setDescription(`<@${interaction.user.id}> has requested to void the game. Do you agree?`);

                    const voidButton = new ButtonBuilder()
                        .setCustomId(`void:${game.id}:${JSON.stringify(otherTeam)}`)
                        .setLabel("Confirm Void")
                        .setStyle(ButtonStyle.Danger);

                    const actionBuilder = new ActionRowBuilder().addComponents(voidButton);

                    await interaction.channel?.send({ embeds: [voidEmbed], components: [actionBuilder as ActionRowBuilder<any>] });

                    const embed = new EmbedBuilder().setColor(colors.successColor).setDescription("Void request sent. The other player must click the button to successfully void the game.");
                    return interaction.editReply({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You can't send a void request for this game.");
                    return interaction.editReply({ embeds: [embed] });
                }
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while voiding this game.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
