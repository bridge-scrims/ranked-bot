const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

const config = require("../../config/config.json");
const mysql = require("mysql");

let con = mysql.createPool({
    connectionLimit: 1000,
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    port: config.port,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    debug: false
});

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.staff)) {
        const reasonSome = interaction.options.getString('reason');
        let reason = reasonSome ? reasonSome : "No reason provided.";
        con.query(`SELECT * FROM tickets WHERE channelid='${interaction.channel.id}'`, async (err, rows) => {
            if (rows.length < 1) {
                const embed = new Discord.EmbedBuilder()
                    .setColor("#2f3136")
                    .setTitle("Error!")
                    .setDescription("This isn't a ticket channel!")
                    .setTimestamp();
                interaction.reply({ embeds: [embed] });
            } else {
                const buttons = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId("tdeny-" + rows[0].id)
                        .setLabel("❌ Deny & Keep Open")
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setCustomId("taccept-" + rows[0].id)
                        .setLabel("✅ Accept & Close")
                        .setStyle(Discord.ButtonStyle.Primary)
                );
                const embed = new Discord.EmbedBuilder()
                    .setColor("#5d9acf")
                    .setTitle("Close Request")
                    .setDescription("<@" + interaction.member.id + "> has requested to close this ticket. Reason:\n```" + reason + "```\nPlease accept or deny using the buttons below.")
                    .setTimestamp();
                await interaction.reply("<@" + rows[0].id + ">");
                await interaction.channel.send({ embeds: [embed], components: [buttons] });
            }
        });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};