import { ActionRowBuilder, ApplicationCommandDataResolvable, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, PermissionFlagsBits } from "discord.js";
import { colors } from "../..";
import { getPlayer } from "../../../database/impl/players/impl/get";
import { getUser } from "../../../lib/impl/minecraft/scrims/user";
import { getGamesByPage, getGamesByPlayer } from "../../../database/impl/games/impl/get";

export default {
    name: "games",
    description: "Displays the past games.",
    options: [
        {
            name: "player",
            description: "The player to display the games for.",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
        {
            name: "page",
            description: "The page of the leaderboard to display.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply();
            const player = interaction.options.get("player")?.user;
            const page = interaction.options.get("page") ? (interaction.options.get("page")?.value as number) : 0;

            const games = player ? await getGamesByPlayer(interaction.guildId ?? "", player.id, page) : await getGamesByPage(interaction.guildId ?? "", page);
            if (!games || games.length === 0) {
                await interaction.editReply("No games found.");
                return;
            }

            const embed = new EmbedBuilder().setTitle("Games").setColor(colors.baseColor).setFooter({ text: `Page ${page + 1}` }).setTimestamp();

            let description = "```";

            for (let i = 0; i < games.length; i++) {
                const user = await getPlayer(interaction.guildId ?? "", games[i].player1_id);
                const player1 = await getUser(user?.mc_uuid ?? "");
                const user2 = await getPlayer(interaction.guildId ?? "", games[i].player2_id);
                const player2 = await getUser(user2?.mc_uuid ?? "");
                
                if (games[i].player1_score === -1 || games[i].player2_score === -1) {
                    description += `${page * 10 + i + 1}. ${player1?.username} vs ${player2?.username}. GAME VOIDED\n`;
                } else {
                    description += `${page * 10 + i + 1}. ${player1?.username} vs ${player2?.username}. Score: ${games[i].player1_score} - ${games[i].player2_score}\n`;
                }
            }

            embed.setDescription(description + "```");

            const previousPageButton = new ButtonBuilder()
                .setCustomId(`games:${page - 1}:previous:${player?.id ?? "NONE"}`)
                .setLabel("Previous Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(page === 0);
            const nextPageButton = new ButtonBuilder()
                .setCustomId(`games:${page + 1}:next:${player?.id ?? "NONE"}`)
                .setLabel("Next Page")
                .setStyle(ButtonStyle.Success)
                .setDisabled(games.length < 10);

            const actionBuilder = new ActionRowBuilder().addComponents(previousPageButton, nextPageButton);

            await interaction.editReply({ embeds: [embed], components: [actionBuilder as ActionRowBuilder<any>] });
        } else {
            return;
        }
    },
} as ApplicationCommandDataResolvable;
