const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    const errorEmbed = new Discord.EmbedBuilder()
        .setColor("#a84040")
        .setDescription("This command isn't finished.")
        .setTimestamp();
    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
};