const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    let type = interaction.options.getString("type");
    if (!type) {
        type = "elo";
    }
    let lb = await gameFunctions.getLeaderboard(type);
    if (!lb) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("There isn't a current leaderboard!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
    let lbDesc = "```";
    for (let i = 0; i < 10; i++) {
        if (type === "elo") {
            lbDesc += `${i.toString().padEnd(2, " ")}${lb[i].name.toString().padEnd(17, " ")} ${lb[i].elo.toString().padEnd(4, " ")}\n`;
        }
        if (type === "wins") {
            lbDesc += `${i.toString().padEnd(2, " ")}${lb[i].name.toString().padEnd(17, " ")} ${lb[i].wins.toString().padEnd(4, " ")}\n`;            
        }
        if (type === "losses") {
            lbDesc += `${i.toString().padEnd(2, " ")}${lb[i].name.toString().padEnd(17, " ")} ${lb[i].losses.toString().padEnd(4, " ")}\n`;
        }
        if (type === "bestws") {
            lbDesc += `${i.toString().padEnd(2, " ")}${lb[i].name.toString().padEnd(17, " ")} ${lb[i].bestws.toString().padEnd(4, " ")}\n`;
        }
        if (type === "games") {
            lbDesc += `${i.toString().padEnd(2, " ")}${lb[i].name.toString().padEnd(17, " ")} ${lb[i].games.toString().padEnd(4, " ")}\n`;
        }
    }
    lbDesc = lbDesc + "```";
    const successEmbed = new Discord.EmbedBuilder()
        .setColor('#36699c')
        .setTitle("Leaderboard")
        .setDescription(lbDesc)
        .setTimestamp();
    interaction.reply({ embeds: [successEmbed] });
};