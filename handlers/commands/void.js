const Discord = require("discord.js");

const variables = require("../variables.js");
const channels = require("../../config/channels.json");
const functions = require("../functions.js");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    let isIG = false;
    for (let i = 0; i < variables.curGames.length; i++) {
        if (variables.curGames[i][0] === interaction.member.id) {
            if (variables.curGames[i][1] === interaction.channel.id) {
                isIG = true;
                let canVoid = true;
                for (var j = 0; j < variables.voids.length; j++) {
                    if (variables.voids[j][1] === interaction.channel.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor(configColors.error)
                            .setDescription("Someone's already voiding this game!")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        canVoid = false;
                        return;
                    }
                }

                if (canVoid) {
                    variables.voids.push([interaction.member.id, interaction.channel.id]);
                    const voidEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.neutral)
                        .setTitle('Void Request')
                        .setDescription("<@" + interaction.member.id + "> has requested to void this game.")
                        .setTimestamp()
                    const buttons = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId("void")
                                .setLabel('Void')
                                .setStyle(Discord.ButtonStyle.Success),
                            new Discord.ButtonBuilder()
                            .setCustomId("antivoid")
                            .setLabel('Don\'t Void')
                            .setStyle(Discord.ButtonStyle.Danger)
                        );
                    interaction.reply({ embeds: [voidEmbed], components: [buttons] });
                    break;
                }
            }
        }
    }

    if (!isIG) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You're not in a game.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
};