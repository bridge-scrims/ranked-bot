const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const channels = require("../../config/channels.json");

module.exports.run = async (interaction) => {
    if (interaction.channel.id === channels.registerChannel) {
        let username = interaction.options.getString("ign");
        await gameFunctions.getUUID(username).then(async (data) => {
            if (!data.name) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("`" + username + "` isn't a valid username!")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
            await gameFunctions.getHypixel(data.uuid).then(async (hypixel) => {
                let socialMedia = hypixel.player.socialMedia;
                if (!socialMedia || !socialMedia.links || !socialMedia.links.DISCORD) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor('#a84040')
                        .setDescription("`" + data.name + "` hasn't linked their Discord!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    return;
                }
                if (socialMedia.links.DISCORD != undefined) {
                    let linkedDiscord = socialMedia.links.DISCORD;
                    if (linkedDiscord != interaction.member.user.tag) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("`" + data.name + "`'s account is linked to `" + linkedDiscord + "`!")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    }
                    let isDb = await gameFunctions.isInDb(interaction.member.id);
                    if (!isDb) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("k we'll insert u sec")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("ur already in db")
                            .setTimestamp();
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
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
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("An error occurred! Please try again.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            console.error(err);
            return;
        });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You can only use `/register` in <#" + channels.registerChannel + ">.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
};