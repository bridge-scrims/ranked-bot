const Discord = require("discord.js");

const gameFunctions = require("../game/gameFunctions.js");
const functions = require("../functions.js");
const configColors = require("../../config/colors.json");
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
/*
con.query(`SELECT * FROM tickets WHERE channelid='${interaction.channel.id}'`, async (err, rows) => {
    if (err) throw err;
    if (rows.length < 1) {
        const embed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("Error!")
            .setDescription("This isn't a ticket channel!")
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    } else {
        transcribe(interaction.channel.id, "<b>" + interaction.member.user.username + "</b> closed the ticket.");
        const cName = interaction.channel.name;
        let splitThing = cName.split("-");
        const idThing = rows[0].id;
        sendTranscription(interaction, interaction.channel.id, splitThing[1], idThing);
        con.query(`DELETE FROM tickets WHERE id='${rows[0].id}'`, async (erre, rowse) => {
            if (erre) throw erre;
            interaction.channel.delete();
        });
    }
});
*/

module.exports.run = async (interaction) => {
    if (interaction.member.roles.cache.has(roles.staff)) {
        const reasonSome = interaction.options.getString('reason');
        let reason = reasonSome ? reasonSome : "No reason provided.";
        con.query(`SELECT * FROM tickets WHERE channelid='${interaction.channel.id}'`, async (err, rows) => {
            if (rows.length < 1) {
                const embed = new Discord.EmbedBuilder()
                    .setColor(configColors.error)
                    .setTitle("Error!")
                    .setDescription("This isn't a ticket channel!")
                    .setTimestamp();
                interaction.reply({ embeds: [embed] });
            } else {
                con.query(`DELETE FROM tickets WHERE id='${interaction.channel.id}'`, async (erre, rowse) => {
                    if (erre) throw erre;
                    interaction.channel.delete();
                });
            }
        });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};