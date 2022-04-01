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
    let description = `
    1. ${lb[0].name}
    `;
};