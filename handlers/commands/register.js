const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    if (interaction.channel.id === channels.registerChannel) {
        let username = interaction.options.getString("ign");
        await gameFunctions.getUUID(username).then(async (data) => {
            if (!data.name) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("`" + username + "` isn't a valid username!")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
            await gameFunctions.getHypixel(data.uuid).then(async (hypixel) => {
                let socialMedia = hypixel.player.socialMedia;
                if (!socialMedia || !socialMedia.links || !socialMedia.links.DISCORD) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("`" + data.name + "` hasn't linked their Discord!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    return;
                }
                if (socialMedia.links.DISCORD != undefined) {
                    let linkedDiscord = socialMedia.links.DISCORD;
                    if (linkedDiscord != interaction.member.user.tag) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor(configColors.error)
                            .setDescription("`" + data.name + "`'s account is linked to `" + linkedDiscord + "`!")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    }
                    let isDb = await gameFunctions.isInDb(interaction.member.id);
                    let rankedRole = await gameFunctions.getRole(interaction.guild, roles.rankedPlayer);
                    let unverifiedRole = await gameFunctions.getRole(interaction.guild, roles.unverified);
                    let coalDiv = await gameFunctions.getRole(interaction.guild, roles.coalDivision);
                    interaction.member.roles.add(rankedRole);
                    interaction.member.roles.add(coalDiv);
                    interaction.member.roles.remove(unverifiedRole);

                    if (!isDb) {
                        await gameFunctions.insertUser(interaction.member.id, data.name, data.uuid);
                        let uuid = await gameFunctions.getUUID(data.name);
                        const successEmbed = new Discord.EmbedBuilder()
                            .setColor(configColors.neutral)
                            .setAuthor({ name: "Registered you as " + data.name + "!", iconURL: "https://mc-heads.net/avatar/" + uuid.uuid + "/64"})
                            .setTimestamp();
                        interaction.reply({ embeds: [successEmbed], ephemeral: true });
                        interaction.member.setNickname("[1000] " + data.name);
                        return;
                    } else {
                        let uuid = await gameFunctions.getUUID(data.name);
                        const successEmbed = new Discord.EmbedBuilder()
                            .setColor(configColors.neutral)
                            .setAuthor({ name: "Welcome back " + data.name + "!", iconURL: "https://mc-heads.net/avatar/" + uuid.uuid + "/64"})
                            .setTimestamp();
                        interaction.reply({ embeds: [successEmbed], ephemeral: true });
                        let elo = await gameFunctions.getELO(interaction.member.id);
                        interaction.member.setNickname("[" + elo + "] " + data.name);
                        return;
                    }
                }
            }).catch((err) => {
                functions.sendError(functions.objToString(err), interaction.guild, "Hypixel API")
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("<@" + interaction.member.id + ">, an error occurred! Please try again.")
                    .setTimestamp();
                interaction.channel.send({ embeds: [errorEmbed] }).then((msg) => {
                    setTimeout(function() {
                        if (!msg) {
                            return;
                        } else {
                            msg.delete();
                        }
                    }, 4000);
                });
                return;
            });
        }).catch((err) => {
            functions.sendError(functions.objToString(err), interaction.guild, "Mojang API")
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor(configColors.error)
                .setDescription("An error occurred! Please try again.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            console.error(err);
            return;
        });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You can only use `/register` in <#" + channels.registerChannel + ">.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
};