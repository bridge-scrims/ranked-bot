const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.staff)) {
        const user = interaction.options.getUser('user');
        await gameFunctions.unmuteUser(interaction.guild, user.id);
        const muteEmbed = new Discord.EmbedBuilder()
            .setColor("#2f3136")
            .setTitle(user.username + "#" + user.discriminator + " is now unmuted.")
            .setTimestamp();
        interaction.reply({ embeds: [muteEmbed] });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};