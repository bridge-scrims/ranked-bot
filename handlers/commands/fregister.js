const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    let ign = interaction.options.getString("ign");
    let user = interaction.options.getUser("user");
    let isDb = await gameFunctions.isInDb(user.id);
    if (interaction.member.roles.cache.has(roles.staff)) {
        if (!isDb) {
            await gameFunctions.insertUser(user.id, ign);
            let member = await gameFunctions.getUser(interaction.guild, user.id);
            let rankedRole = await gameFunctions.getRole(interaction.guild, roles.rankedPlayer);
            let unverifiedRole = await gameFunctions.getRole(interaction.guild, roles.unverified);
            let coalDiv = await gameFunctions.getRole(interaction.guild, roles.coalDivision);
            member.roles.add(rankedRole);
            member.roles.add(coalDiv);
            member.roles.remove(unverifiedRole);
            member.setNickname("[1000] " + ign);
            const successEmbed = new Discord.EmbedBuilder()
                .setColor('#36699c')
                .setDescription("Registered <@" + user.id + "> as `" + ign + "`!")
                .setTimestamp();
            interaction.reply({ embeds: [successEmbed] });
        } else {
            let memberElo = await gameFunctions.getELO(user.id);
            let member = await gameFunctions.getUser(interaction.guild, user.id);
            let rankedRole = await gameFunctions.getRole(interaction.guild, roles.rankedPlayer);
            let unverifiedRole = await gameFunctions.getRole(interaction.guild, roles.unverified);
            member.roles.add(rankedRole);
            member.roles.remove(unverifiedRole);
            await gameFunctions.fixRoles(interaction, user.id);
            member.setNickname("[" + memberElo + "] " + ign);
            const successEmbed = new Discord.EmbedBuilder()
                .setColor('#36699c')
                .setDescription("<@" + user.id + "> was already in the database, so fixed their roles and nickname.")
                .setTimestamp();
            interaction.reply({ embeds: [successEmbed] });
        }
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}