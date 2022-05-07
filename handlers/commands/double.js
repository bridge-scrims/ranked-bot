const Discord = require("discord.js");

const roles = require("../../config/roles.json");
const variables = require("../../handlers/variables.js");

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.staff)) {
        if (variables.double) {
            variables.double = false;
            const doubleEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("Turned off double ELO.")
                .setTimestamp();
            interaction.reply({ embeds: [doubleEmbed] });
        } else {
            variables.double = true;
            const doubleEmbed = new Discord.EmbedBuilder()
                .setColor('#32ad51')
                .setDescription("Turned on double ELO.")
                .setTimestamp();
            interaction.reply({ embeds: [doubleEmbed] });
        }
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};