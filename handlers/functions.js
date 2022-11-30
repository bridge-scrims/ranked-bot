const axios = require("axios"); // HTTP requests
const config = require("../config/config.json");
const channels = require("../config/channels.json");

const Discord = require("discord.js");

const { Readable } = require("stream");

const fs = require("fs");
const util = require("util");
const wait = require("util").promisify(setTimeout);
const https = require("https");

let rL = []; // Rate limit array of people who are currently rate limited
let suggestion = [];

module.exports.exists = exists;

module.exports.capitalizeFirstLetter = capitalizeFirstLetter;

module.exports.logError = logError;
module.exports.sendError = sendError;

module.exports.rateLimit = rateLimit;
module.exports.isRateLimit = isRateLimit;

module.exports.parseBoolean = parseBoolean;

module.exports.isHex = isHex;
module.exports.isImage = isImage;

module.exports.objToString = objToString;

module.exports.makeId = makeId;

module.exports.similarity = similarity;

module.exports.suggestion = suggestion;

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

// Check if someone is rate limited. Return false if not, return true if they are.
function isRateLimit(id) {
    let isLimit = false;
    if (exists(rL, id)) { // Is the user in the rate limit array?
        isLimit = true;
    }
    return isLimit;
}

// Rate limit an user
function rateLimit(id) {
    rL.push(id); // Add them to the array
    setTimeout(function () {
        rL.splice(rL.indexOf(id)); // Remove them after 4 seconds
    }, 4000);
}

// Log errors to the error.log file
function logError(message) {
    let day = new Date().getDate();
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let hours = new Date().getHours() + 1;
    let minutes = new Date().getMinutes() + 1;
    let seconds = new Date().getSeconds() + 1;
    let time =
        month.toString() +
        "/" +
        day.toString() +
        "/" +
        year.toString() +
        "[" +
        hours +
        ":" +
        minutes +
        ":" +
        seconds +
        "]";

    // Write to the file
    let logFile = fs.createWriteStream("./errors/error.log", { flags: "a" });

    // If the message to log doesn't exist...
    if (!message) {
        logFile.write(
            util.format("[" + time + "] " + "Could not get message.") + "\n"
        );
    } else {
        // Add the time stamp to the message
        logFile.write(util.format("[" + time + "] " + message) + "\n");
    }
}

function objToString(obj) {
    var str = '';
    for (var p in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

// Send the error to the channel
async function sendError(message, client, type) {
    // Log the error to the file
    logError(message);

    // Create the embed
    const errorEmbed = new Discord.EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(type.toString()) // Type is the type of error
        .setDescription("```\n" + message.toString() + "\n```") // The actual error message
        .setTimestamp();

    // Fetch the guild
    let guild = await client.fetch(config.guildId).catch(() => null);
    if (!guild) {
        // If the guild doesn't exist then just return but log the error to the file anyways
        console.log("Couldn't get the guild.".red);
        return;
    }

    // Fetch the channel
    let channel = guild.channels.cache.get(channels.errorChannel);
    if (!channel) {
        console.log("Couldn't get the error channel.".red);
        return;
    }

    // Send the embed
    channel.send({ embeds: [errorEmbed] });
}

// Parse a string to boolean
function parseBoolean(val) {
    return val === true || val.toString().toLowerCase() === "true";
}

// Capitilize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Check if a variable exists in an array
function exists(arr, search) {
    return arr.some((row) => row.includes(search));
}

function isHex(str) {
    // credit to KuuHaKu#7337
    return Boolean(str.match(/#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/i));
}

function isImage(url, timeoutT) {
    // credit to jfriend00
    return new Promise(function (resolve, reject) {
        var timeout = timeoutT || 5000;
        var timer, img = new Image();
        img.onerror = img.onabort = function () {
            clearTimeout(timer);
            reject("error");
        };
        img.onload = function () {
            clearTimeout(timer);
            resolve("success");
        };
        timer = setTimeout(function () {
            img.src = "//!!!!/test.jpg";
            reject("timeout");
        }, timeout);
        img.src = url;
    });
}