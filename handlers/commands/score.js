const Discord = require("discord.js");

const variables = require("../variables.js");
const channels = require("../../config/channels.json");
const functions = require("../functions.js");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    let isIG = false;
    for (let i = 0; i < variables.curGames.length; i++) {
        if (variables.curGames[i][0] === interaction.member.id) {
            if (variables.curGames[i][2] === interaction.channel.id) {
                isIG = true;
                let canScore = true;
                for (var j = 0; j < variables.score.length; j++) {
                    if (variables.score[j][1] === interaction.channel.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("Someone's already scoring this!")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        canScore = false;
                        return;
                    }
                }

                if (canScore) {
                    let file = interaction.options.getAttachment("screenshot");
                    if (file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".png") || file.name.toLowerCase().endsWith(".jpeg")) {
                        variables.score.push([interaction.member.id, interaction.channel.id, variables.curGames[i][1]]);
                        const scoreEmbed = new Discord.EmbedBuilder()
                            .setColor('#36699c')
                            .setTitle('Score Request')
                            .setDescription('Please click the button if the screenshot is correct! If it isn\'t, then deny the score request.')
                            .setImage(file.url)
                            .setTimestamp()
                        const buttons = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId("score")
                                .setLabel('Score')
                                .setStyle(Discord.ButtonStyle.Success),
                            new Discord.ButtonBuilder()
                            .setCustomId("deny")
                            .setLabel('Deny')
                            .setStyle(Discord.ButtonStyle.Danger)
                        );
                        interaction.reply({ embeds: [scoreEmbed], components: [buttons] });
                        break;
                    } else {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("Please provide a valid image! Correct file types include `.jpeg`, `.png`, and `.jpg`.")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        break;
                    }
                }
            }
        }
    }

    if (!isIG) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You're not in a game.\nIf this is a bug, ping a scorer.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
};