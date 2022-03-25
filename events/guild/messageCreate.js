const channels = require("../../config/channels.json");

const functions = require("../../handlers/functions.js");

const Discord = require("discord.js");

module.exports = async (client, message) => {
    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice().toLowerCase();
};