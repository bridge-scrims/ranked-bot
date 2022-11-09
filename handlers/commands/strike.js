const Discord = require("discord.js");

const configColors = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    const errorEmbed = new Discord.EmbedBuilder()
        .setColor(configColors.error)
        .setDescription("This command isn't finished.")
        .setTimestamp();
    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
};