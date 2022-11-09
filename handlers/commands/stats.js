const Discord = require("discord.js");

const gameFunctions = require("../game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    let username = interaction.options.getString("user");
    let id;
    if (!username) {
        id = interaction.member.id;
    } else {
        id = username;
    }
    const loadingEmbed = new Discord.EmbedBuilder()
        .setColor(configColors.neutral)
        .setTitle("Loading...")
        .setDescription("This may take a few seconds.")
        .setTimestamp();
    await interaction.reply({ embeds: [loadingEmbed], fetchReply: true }).then(async (msg) => {
        await interaction.channel.messages.fetch(msg.id).then(async (message) => {
            if (!message) {
                return;
            }
            let card = await gameFunctions.scoreCard(id);
            if (!card) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("That user isn't in the database!")
                    .setTimestamp();
                message.edit({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
            message.edit({ embeds: [], files: [card] });
        }).catch((err) => {
            functions.sendError(functions.objToString(err), interaction.guild, "General Message");
            console.error(err);
        });
    }).catch((err) => {
        functions.sendError(functions.objToString(err), interaction.guild, "General Message");
        console.error(err);
    });
};