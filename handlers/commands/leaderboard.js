const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    let type = interaction.options.getString("type");
    if (!type) {
        type = "elo";
    }
    let lb = await gameFunctions.getLeaderboard(type);
    if (!lb) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("There isn't a current leaderboard!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
    let lbDesc = "```";
    for (let i = 1; i <= 10; i++) {
        if (type === "elo") {
            lbDesc += `${i.toString().padEnd(3, " ")}${lb[i - 1].name.toString().padEnd(17, " ")} ${lb[i - 1].elo.toString().padEnd(4, " ")}\n`;
        }
        if (type === "wins") {
            lbDesc += `${i.toString().padEnd(3, " ")}${lb[i - 1].name.toString().padEnd(17, " ")} ${lb[i - 1].wins.toString().padEnd(4, " ")}\n`;            
        }
        if (type === "losses") {
            lbDesc += `${i.toString().padEnd(3, " ")}${lb[i - 1].name.toString().padEnd(17, " ")} ${lb[i - 1].losses.toString().padEnd(4, " ")}\n`;
        }
        if (type === "bestws") {
            lbDesc += `${i.toString().padEnd(3, " ")}${lb[i - 1].name.toString().padEnd(17, " ")} ${lb[i - 1].bestws.toString().padEnd(4, " ")}\n`;
        }
        if (type === "games") {
            lbDesc += `${i.toString().padEnd(3, " ")}${lb[i - 1].name.toString().padEnd(17, " ")} ${lb[i - 1].games.toString().padEnd(4, " ")}\n`;
        }
    }
    lbDesc = lbDesc + "```";
    const successEmbed = new Discord.EmbedBuilder()
        .setColor(configColors.neutral)
        .setTitle("Leaderboard")
        .setDescription(lbDesc)
        .setTimestamp();
    interaction.reply({ embeds: [successEmbed] });
};