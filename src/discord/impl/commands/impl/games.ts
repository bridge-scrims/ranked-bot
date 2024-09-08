import { ActionRowBuilder, ApplicationCommandDataResolvable, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from "discord.js";
import { colors } from "../../..";
import { getPlayer } from "../../../../database/impl/players/impl/get";
import { getUser } from "../../../../lib/impl/minecraft/scrims/user";
import { getGamesByPage, getGamesByPlayer } from "../../../../database/impl/games/impl/get";

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
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            await interaction.deferReply();
            const player = interaction.options.get("player")?.user;
            const page = interaction.options.get("page") ? (interaction.options.get("page")?.value as number) : 0;

            const games = player ? await getGamesByPlayer(interaction.guildId ?? "", player.id, page) : await getGamesByPage(interaction.guildId ?? "", page);
            if (!games || games.length === 0) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("No games found for that page.");
                return interaction.editReply({ embeds: [embed] });
            }

            if (Number(page) !== 0 && Number(page) < 0) {
                const embed = new EmbedBuilder().setColor(colors.errorColor).setDescription("You need to provide a valid page number.");
                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle("Games")
                .setColor(colors.baseColor)
                .setFooter({ text: `Page ${page + 1}` })
                .setTimestamp();

            let description = "```";

            for (let i = 0; i < games.length; i++) {
                const team1 = await Promise.all(games[i].team1_ids.map(async (id) => await getPlayer(interaction.guildId ?? "", id)));
                const team2 = await Promise.all(games[i].team2_ids.map(async (id) => await getPlayer(interaction.guildId ?? "", id)));

                const team1Mc = await Promise.all(team1.map(async (player) => await getUser(player?.mc_uuid ?? "")));
                const team2Mc = await Promise.all(team2.map(async (player) => await getUser(player?.mc_uuid ?? "")));

                if (games[i].team1_score === -1 || games[i].team2_score === -1) {
                    description += `${page * 10 + i + 1}. ${team1Mc.map((player) => player?.username).join(", ")} vs ${team2Mc.map((player) => player?.username).join(", ")}. GAME VOIDED\n`;
                } else {
                    description += `${page * 10 + i + 1}. ${team1Mc.map((player) => player?.username).join(", ")} vs ${team2Mc.map((player) => player?.username).join(", ")}. Score: ${games[i].team1_score} - ${games[i].team2_score}\n`;
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
