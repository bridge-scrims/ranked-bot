const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const configColors = require("../../config/colors.json");
const roles = require("../../config/roles.json");

const variables = require("../../handlers/variables.js");

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.booster) || interaction.member.roles.cache.has(roles.boosterPerks)) {
        let user = interaction.options.getUser("user");
        let canCall = false;
        for (let i = 0; i < variables.curGames.length; i++) {
            if (variables.curGames[i][0] === user.id) {
                canCall = true;
                break;
            }
        }
        if (canCall) {
            let member = await gameFunctions.getUser(interaction.guild, user.id);
            if (!member) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("That user doesn't exist!\n\n*If this is a bug, please let Eltik know...*")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
            if (member.voice != undefined && member.voice.channel != undefined) {
                if (interaction.member.voice != undefined && interaction.member.voice.channel != undefined) {
                    interaction.member.voice.setChannel(member.voice.channel.id);
                    const callEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Moved you to <#" + member.voice.channel.id + ">.")
                        .setTimestamp();
                    interaction.reply({ embeds: [callEmbed], ephemeral: true });
                } else {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("You need to be in a VC to use this command!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    return;
                }
            } else {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("<@" + user.id + "> isn't in a VC!")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
        } else {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor(configColors.error)
                .setDescription("<@" + user.id + "> isn't in a game!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You don't have permission to use this command! You need to be an <@&" + roles.booster + ">.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
};