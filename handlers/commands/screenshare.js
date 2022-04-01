const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    let user = interaction.options.getString("user");
    let member = await gameFunctions.getUser(interaction.guild, user);
    if (!member) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("<@" + user + "> isn't in the server!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    } else {
        await gameFunctions.screenshareUser(interaction.guild, member, interaction.member).then((channelId) => {
            const successEmbed = new Discord.EmbedBuilder()
                .setColor('#36699c')
                .setDescription("<#" + channelId + ">")
                .setTimestamp();
            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        });
    }
};