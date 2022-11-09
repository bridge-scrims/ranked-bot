const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    let user = interaction.options.getString("user");
    let member = await gameFunctions.getUser(interaction.guild, user);
    if (!member) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("<@" + user + "> isn't in the server!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    } else {
        await gameFunctions.screenshareUser(interaction.guild, member, interaction.member).then((channelId) => {
            const successEmbed = new Discord.EmbedBuilder()
                .setColor(configColors.success)
                .setDescription("<#" + channelId + ">")
                .setTimestamp();
            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        });
    }
};