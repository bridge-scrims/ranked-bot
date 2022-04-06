const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");
const gameFunctions = require("../../handlers/game/gameFunctions.js");
const Discord = require("discord.js");

module.exports = async (client, member) => {
    const joinEmbed = new Discord.EmbedBuilder()
        .setColor('#36699c')
        .setDescription("**Welcome " + member.user.tag + "!**\n\nPlease use the `/register <ign>` command to register yourself and view other channels! If you cannot do so, open a ticket (tbd).")
        .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
        .setTimestamp();
    member.guild.channels.cache.get(channels.registerChannel).send({ embeds: [joinEmbed] });

    let role = member.guild.roles.cache.get(roles.unverified);
    member.roles.add(role);
    
    let banned = await gameFunctions.isBanned(member.id);
    if (banned) {
        let roleBan = member.guild.roles.cache.get(roles.banned);
        member.roles.add(roleBan);
        member.roles.remove(role);
        console.log(member.user.tag + " joined the server.".dim + " They were banned.".red);
    } else {
        console.log(member.user.tag + " joined the server.".dim);
    }
}