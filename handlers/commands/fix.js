const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    let user = interaction.options.getUser('user');
    let isDb = await gameFunctions.isInDb(user.id);
    if (!isDb) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor("#a84040")
            .setDescription("<@" + user.id + "> isn't registered!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
    await gameFunctions.resetName(interaction, user.id);
    await gameFunctions.fixRoles(interaction, user.id);
    const successEmbed = new Discord.EmbedBuilder()
        .setColor("#36699c")
        .setDescription("Fixed <@" + user.id + ">'s name and roles.")
        .setTimestamp();
    interaction.reply({ embeds: [successEmbed], ephemeral: true });
};