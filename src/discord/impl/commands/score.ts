import { ActionRowBuilder, ApplicationCommandDataResolvable, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../..";
import { getGameByChannelId } from "../../../database/impl/games/impl/get";

export default {
    name: "score",
    description: "Sends a score request.",
    options: [
        {
            name: "screenshot",
            description: "Screenshot of the game results.",
            type: ApplicationCommandOptionType.Attachment,
            required: true,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.UseApplicationCommands,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });
            const screenshot = interaction.options.get("screenshot");
            if (!screenshot || !screenshot.value) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("No screenshot provided.");
                return interaction.editReply({ embeds: [embed] });
            }

            if (
                !screenshot.attachment?.name.toLowerCase().endsWith(".jpg") &&
                !screenshot.attachment?.name.toLowerCase().endsWith(".heic") &&
                !screenshot.attachment?.name.toLowerCase().endsWith(".png") &&
                !screenshot.attachment?.name.toLowerCase().endsWith(".jpeg") &&
                !screenshot.attachment?.name.toLowerCase().endsWith(".gif")
            ) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("Invalid file format. Please provide a `.jpg`, `.jpeg`, `.heic`, `.png`, or `.gif` file.");
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                const game = await getGameByChannelId(interaction.guildId ?? "", interaction.channelId, "textChannel");
                if (!game) {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You can only score the game in the game channel.");
                    return interaction.editReply({ embeds: [embed] });
                }

                if (game?.team1_ids.includes(interaction.user.id) || game?.team2_ids.includes(interaction.user.id)) {
                    const otherTeam = game.team1_ids.includes(interaction.user.id) ? game.team2_ids : game.team1_ids;
                    const scoreEmbed = new EmbedBuilder().setColor(colors.baseColor).setTitle("Score Request").setDescription(`<@${interaction.user.id}> has requested to score the game. Do you agree?`).setImage(screenshot.attachment.url);

                    const scoreButton = new ButtonBuilder()
                        .setCustomId(`score:${game.id}:${JSON.stringify(otherTeam)}`)
                        .setLabel("Confirm Score")
                        .setStyle(ButtonStyle.Success);

                    const actionBuilder = new ActionRowBuilder().addComponents(scoreButton);

                    await interaction.channel?.send({ embeds: [scoreEmbed], components: [actionBuilder as ActionRowBuilder<any>] });

                    const embed = new EmbedBuilder().setColor(colors.successColor).setDescription("Score request sent. The other player must click the button to successfully score the game.");
                    return interaction.editReply({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You can't send a score request for this game.");
                    return interaction.editReply({ embeds: [embed] });
                }
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while scoring this game.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
