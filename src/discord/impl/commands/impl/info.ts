import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder, Interaction } from "discord.js";
import { colors } from "../../..";
import { getUser } from "../../../../lib/impl/minecraft/scrims/user";
import { getPlayer } from "../../../../database/impl/players/impl/get";
import { generateStatsCard } from "../../../../lib/impl/game/generateStatsCard";

export default {
    name: "info",
    description: "Fetches information about an user.",
    options: [
        {
            name: "user",
            description: "The user to fetch information about.",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });

            const user = interaction.options.get("user")?.user ?? interaction.user;

            const player = await getPlayer(interaction.guildId ?? "", user.id);
            if (!player) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`User <@${user.id}> not found on Ranked Bridge. Please register using \`/register\`.`);
                return interaction.editReply({ embeds: [embed] });
            }

            const scrimsData = await getUser(player?.mc_uuid ?? "");
            if (!scrimsData) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription(`Player <@${user.id}> not found on Bridge Scrims. Please use \`/verify\` on Bridge Scrims to link your Discord account.`);
                return interaction.editReply({ embeds: [embed] });
            }

            const statsCard = await generateStatsCard(player, scrimsData);
            const attachment = new AttachmentBuilder(statsCard, { name: "scorecard.png" });

            return interaction.editReply({ files: [attachment] });
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
