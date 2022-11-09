const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const roles = require("../../config/roles.json");
const configColors = require("../../config/colors.json");

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.staff)) {
        let user = interaction.options.getString("user");
        let type = interaction.options.getString("type");
        let num = interaction.options.getNumber("amount");
        if (!gameFunctions.isInDb(user)) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor(configColors.error)
                .setDescription("That user isn't in the database!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        if (type === "elo") {
            gameFunctions.setElo(user, num).then((res) => {
                if (!res) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("<@" + user + "> isn't in the database!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Set <@" + user + ">'s `" + type + "` to `" + num + "`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("An error occurred setting <@" + user + "> `" + type + "` to `" + num + "`! Contact Eltik ASAP.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        } else if (type === "wins") {
            gameFunctions.setWins(user, num).then((res) => {
                if (!res) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("<@" + user + "> isn't in the database!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Set <@" + user + ">'s `" + type + "` to `" + num + "`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("An error occurred setting <@" + user + "> `" + type + "` to `" + num + "`! Contact Eltik ASAP.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        } else if (type === "losses") {
            gameFunctions.setLosses(user, num).then((res) => {
                if (!res) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("<@" + user + "> isn't in the database!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Set <@" + user + ">'s `" + type + "` to `" + num + "`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("An error occurred setting <@" + user + "> `" + type + "` to `" + num + "`! Contact Eltik ASAP.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        } else if (type === "games") {
            gameFunctions.setUserGames(user, num).then((res) => {
                if (!res) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("<@" + user + "> isn't in the database!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Set <@" + user + ">'s `" + type + "` to `" + num + "`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("An error occurred setting <@" + user + "> `" + type + "` to `" + num + "`! Contact Eltik ASAP.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        } else if (type === "winstreak") {
            gameFunctions.setWinstreak(user, num).then((res) => {
                if (!res) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("<@" + user + "> isn't in the database!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Set <@" + user + ">'s `" + type + "` to `" + num + "`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("An error occurred setting <@" + user + "> `" + type + "` to `" + num + "`! Contact Eltik ASAP.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        } else if (type === "bestws") {
            gameFunctions.setBestwinstreak(user, num).then((res) => {
                if (!res) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.error)
                        .setDescription("<@" + user + "> isn't in the database!")
                        .setTimestamp();
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor(configColors.success)
                        .setDescription("Set <@" + user + ">'s `" + type + "` to `" + num + "`.")
                        .setTimestamp();
                    interaction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            }).catch((err) => {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setDescription("An error occurred setting <@" + user + "> `" + type + "` to `" + num + "`! Contact Eltik ASAP.")
                    .setTimestamp();
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        } else {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor(configColors.error)
                .setDescription("Unknown type specified!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};