const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.staff)) {
        const user = interaction.options.getString('user');
        const days = interaction.options.getInteger('days');
        let reason = interaction.options.getString('reason');
        let name = await gameFunctions.getName(user);
        if (!reason) {
            reason = "No reason provided.";
        }
        await gameFunctions.banUser(interaction.guild, user, days, reason);
        const banEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.neutral)
            .setTitle(name + " recieved a ban")
            .setDescription("User: <@" + user + ">\nTime: `" + days + " days`.\nReason: ```" + reason + "```")
            .setTimestamp();
        interaction.reply({ embeds: [banEmbed] });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};