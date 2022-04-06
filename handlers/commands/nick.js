const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.booster) || interaction.member.roles.cache.has(roles.boosterPerks)) {
        let curNick = interaction.member.displayName;
        if (interaction.options.getSubcommand() === 'reset') {
            let isDb = await gameFunctions.isInDb(interaction.member.id);
            if (!isDb) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("You aren't registered! To reset your nick, please register in <#" + channels.registerChannel + ">.\n\nIf you're already registered, please contact <@" + roles.staff + ">.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
            await gameFunctions.resetName(interaction, interaction.member.id);
            await gameFunctions.fixRoles(interaction, interaction.member.id);
            const successEmbed = new Discord.EmbedBuilder()
                .setColor("#36699c")
                .setDescription("Reset your nick.")
                .setTimestamp();
            interaction.reply({ embeds: [successEmbed], ephemeral: true });
        }
        if (interaction.options.getSubcommand() === 'set') {
            let nick = interaction.options.getString("nick");
            if (nick.length > 20) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("Please provide a valid nickname!")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            } else {
                if ((curNick + " (" + nick + ")").length > 32) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("That nickname is too long!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    return;
                }
                if (curNick.startsWith("[")) {
                    if (curNick.endsWith(")")) {
                        let elo = await gameFunctions.getELO(interaction.member.id);
                        let name = await gameFunctions.getName(interaction.member.id);
                        curNick = "[" + elo + "] " + name;
                    }
                    interaction.member.setNickname(curNick + " (" + nick + ")");
                    const nickEmbed = new Discord.EmbedBuilder()
                        .setColor("#36699c")
                        .setDescription("Set your nickname to `" + curNick + " (" + nick + ")`.\n\nYou can change your nickname again by using `/nick set [nickname]`.")
                        .setTimestamp();
                        interaction.reply({ embeds: [nickEmbed], ephemeral: true });
                } else {
                    if (curNick.endsWith(")")) {
                        let name = await gameFunctions.getName(interaction.member.id);
                        curNick = name;
                    }
                    interaction.member.setNickname(curNick + " (" + nick + ")");
                    const nickEmbed = new Discord.EmbedBuilder()
                        .setColor("#36699c")
                        .setDescription("Set your nickname to `" + curNick + " (" + nick + ")`.\n\nYou can change your nickname again by using `/nick set [nickname]`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [nickEmbed], ephemeral: true });
                }
            }
        } else if (interaction.options.getSubcommand() === "hide") {
            let name = await gameFunctions.getName(interaction.member.id);
            if (curNick.endsWith(")")) {
                let nickSplit = curNick.split("] ");
                if (nickSplit[1] != undefined) {
                    interaction.member.setNickname(nickSplit[1]);
                    const nickEmbed = new Discord.EmbedBuilder()
                        .setColor("#36699c")
                        .setDescription("Hid your nickname.\n\nYou can change your nickname again by using `/nick set [nickname]`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [nickEmbed], ephemeral: true });
                }
            }
        }
    }
};