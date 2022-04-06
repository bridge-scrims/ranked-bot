const Discord = require("discord.js");

const variables = require("../variables.js");
const channels = require("../../config/channels.json");
const functions = require("../functions.js");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    if (interaction.channel.id === channels.queueChatChannel) {
        if (!interaction.member.voice || !interaction.member.voice.channel) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You have to be in <#" + channels.queueChannel + "> to use `/ping`.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        if (interaction.member.voice.channel != channels.queueChannel) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You have to be in <#" + channels.queueChannel + "> to use `/ping`.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        if (!functions.exists(variables.pingCooldown, interaction.member.id)) {
            const pingEmbed = new Discord.EmbedBuilder()
                .setColor("#36699c")
                .setDescription("Pinged <@&" + roles.queuePing + ">.")
                .setTimestamp();
            interaction.reply({ embeds: [pingEmbed], ephemeral: true });
            interaction.channel.send("<@&" + roles.queuePing + ">");
            variables.pingCooldown.push(interaction.member.id);
            setTimeout(function() {
                for (let i = 0; i < variables.pingCooldown.length; i++) {
                    if (variables.pingCooldown[i] === interaction.member.id) {
                        variables.pingCooldown.splice(i, 1);
                    }
                }
            }, 60000);
        } else {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You can only ping <@" + roles.queuePing + "> once every minute.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You can only use `/ping` in <#" + channels.queueChatChannel + ">.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
};