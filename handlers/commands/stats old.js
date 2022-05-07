const Discord = require("discord.js");

const gameFunctions = require("../game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    let username = interaction.options.getString("user");
    let stats;
    if (!username) {
        stats = await gameFunctions.getStats(interaction.member.id);
    } else {
        stats = await gameFunctions.getStats(username);
    }
    if (!stats) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("`" + username + "` isn't a valid user! If you are waiting for the autocomplete, press **tab** and select one of the options.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
    }
    let wins = stats.wins;
    let losses = stats.losses;
    let elo = stats.elo;
    let winstreak = stats.winstreak;
    let games = stats.games;
    let bestws = stats.bestws;
    let name = stats.name;
    let uuid = await gameFunctions.getUUID(name);
    if (!uuid.uuid) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("`" + name + "` isn't an actual account! If this is your account, use `/rename` to rename your account.")
            .setTimestamp();
        interaction.channel.send({ embeds: [errorEmbed] });
    }
    let division = stats.division;
    let wl;
    if (losses === 0 || isNaN(wins / losses)) {
        wl = wins;
    } else {
        wl = (wins / losses).toFixed(2);
    }
    let file;
    let imageLink;
    let color;
    if (division === "COAL") {
        file = new Discord.MessageAttachment("./images/coal.png");
        imageLink = "attachment://coal.png";
        color = "#1a1a1a";
    } else if (division === "IRON") {
        file = new Discord.MessageAttachment("./images/iron.png");
        imageLink = "attachment://iron.png";
        color = "#c2c2c2";
    } else if (division === "GOLD") {
        file = new Discord.MessageAttachment("./images/gold.png");
        imageLink = "attachment://gold.png";
        color = "#f0df48";
    } else if (division === "DIAMOND") {
        file = new Discord.MessageAttachment("./images/diamond.png");
        imageLink = "attachment://diamond.png";
        color = "#64e3da";
    } else if (division === "EMERALD") {
        file = new Discord.MessageAttachment("./images/emerald.png");
        imageLink = "attachment://emerald.png";
        color = "#6ee364";
    } else if (division === "OBSIDIAN") {
        file = new Discord.MessageAttachment("./images/obsidian.png");
        imageLink = "attachment://obsidian.png";
        color = "#1d0024";
    } else if (division === "CRYSTAL") {
        file = new Discord.MessageAttachment("./images/crystal.png");
        imageLink = "attachment://crystal.png";
        color = "#fca9f4";
    } else {
        file = new Discord.MessageAttachment("../images/coal.png");
        imageLink = "attachment://coal.png";
        color = "#1a1a1a";
    }
    const statsEmbed = new Discord.EmbedBuilder()
        .setColor(color)
        .setTitle(name + "'s Stats")
        .addFields(
            { name: "ELO", value: "`" + elo.toString() + "` ELO" },
            { name: "Wins", value: "`" + wins.toString() + "` Wins" },
            { name: "Losses", value: "`" + losses.toString() + "` Losses" },
            { name: "Winstreak", value: "`" + winstreak.toString() + "` Winstreak" },
            { name: "Best Winstreak", value: "`" + bestws.toString() + "` Winstreak" },
            { name: "Games Played", value: "`" + games.toString() + "` Games" },
            { name: "W/L", value: "`" + wl.toString() + "` W/L" },
        )
        .setThumbnail(imageLink)
        .setImage("https://mc-heads.net/body/" + uuid.uuid + "/right")
        .setTimestamp();
    interaction.reply({ embeds: [statsEmbed], files: [file] });
};