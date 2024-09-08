import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, EmbedBuilder, Interaction } from "discord.js";
import { colors } from "../../..";
import { getUserByUsername } from "../../../../lib/impl/minecraft/scrims/user";
import { getPlayer } from "../../../../database/impl/players/impl/get";
import { register } from "../../../../lib/impl/game/register";

export default {
    name: "register",
    description: "Registers an user",
    options: [
        {
            name: "username",
            description: "Your Minecraft username",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const username = interaction.options.get("username");
            if (!username || !username.value) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You need to provide a username.");
                return interaction.editReply({ embeds: [embed] });
            }

            const user = await getUserByUsername(String(username.value));
            if (!user) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`User \`${username.value}\` not found on Bridge Scrims. Please join the Scrims server and use \`/verify\` to link your Minecraft account.`);
                return interaction.editReply({ embeds: [embed] });
            }

            if (user.discordId !== interaction.user.id) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("This username is linked to someone else's account. Please try again.");
                return interaction.editReply({ embeds: [embed] });
            }

            const player = await getPlayer(interaction.guildId ?? "", interaction.user.id);
            if (player) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`You are already registered on Ranked Bridge.`);
                return interaction.editReply({ embeds: [embed] });
            }

            try {
                await register(interaction.guildId ?? "", interaction.user.id, user._id);
                const embed = new EmbedBuilder().setColor(colors.successColor).setDescription("You have been successfully registered on Ranked Bridge.");
                return interaction.editReply({ embeds: [embed] });
            } catch (e) {
                console.error(e);
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("An error occurred while registering. Please try again.");
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
