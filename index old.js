/*
 * Chat:
 *
 */

// IMPORTANT INFORMATION:
/*
Discord.JS version: v13
Node.JS version: v16
Copyright 2021:
Created by Eltik#5776
*/

// Canvas options:
// https://www.npmjs.com/package/canvas

// Tesseract.JS:
/*
npm install tesseract.js yarn add tesseract.js
*/

// MySQL:
/*
To install MySQL:
npm install mysql --save
*/

// node-fetch
/*
To install node-fetch:
npm install node-fetch
EDIT: Latest version of node-fetch sucks. Copy and paste it from an OLD version of Ranked Bridge.
*/

// chart.js
/*
To install chart.js:
npm install chart.js
*/

// quick-chart.js
/*
To install quick-chart.js:
npm install quick-chart.js

Refer to https://quickchart.io/documentation/send-charts-discord-bot/
*/

// Discord.JS:
// When first starting up RankedBridge use this:
/*
npm init -y
npm install discord.js
node index.js
*/

// Slash commands:
// The bot will likely require slash commands, so this is the command for importing them:
/*
 * npm install @discordjs/rest discord-api-types
 */

// hypixel
// npm i --save @zikeji/hypixel

// Elo rating
// npm install elo-rating

// Get the library Discord.JS
const Discord = require("discord.js");
const onExit = require("signal-exit");
const { prefix, token, guildId, clientId, host, username, password, database, apiKey, googleForm } = require("./config.json");
const { queueChannel, registerChannel, commandsChannel, queueChatChannel, suggestionsChannel, screenshareChannel, bansChannel, punishmentsChannel, gamesChannel, generalMuted, reportChannel, queueCategory } = require("./channels.json");
const { helper, moderator, admin, coalDivision, ironDivision, goldDivision, diamondDivision, emeraldDivision, obsidianDivision, crystalDivision, rankedPlayer, unverified, queuePing, eventPing, announcementPing, invisible, ghost, strikeOne, strikeTwo, strikeThree, strikeFour, strikeFive, hybrid, defender, attacker, frozen, muted, banned, jrScreensharer, screensharer, srScreensharer, staff, scorer } = require("./roles.json");

const client = new Discord.Client({
    intents: [
        "GUILD_MEMBERS",
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_VOICE_STATES",
        "GUILD_MESSAGE_REACTIONS",
    ],
});

let limit = [];

// Google Forms
const { Spreadsheet } = require("google-formify");
const spreadsheet = new Spreadsheet(googleForm);

const { Modal, TextInputComponent, showModal } = require('discord-modals');
const discordModals = require('discord-modals');
discordModals(client);

const path = require("path");

const { MessageAttachment } = require("discord.js");

// node-fetch
const fetch = require("node-fetch");

// mysql
const mysql = require("mysql");

// Charts
const { Chart } = require("chart.js");
const QuickChart = require("quickchart-js");

// zikeji/hypixel
const { Client } = require("@zikeji/hypixel");
// Creates a new instance of Hypixel API (I think?) with an API key.
const hypixel = new Client(apiKey);

// blackList is a list of blacklisted words
const blacklist = [];

var kFactor = 16;
var nFactor = 500;
var saturday = false;
const glicko2 = require("glicko2");
var settings = {
    // tau : "Reasonable choices are between 0.3 and 1.2, though the system should
    //      be tested to decide which value results in greatest predictive accuracy."
    tau: 0.9,
    // rating : default rating
    rating: 1000,
    //rd : Default rating deviation
    //     small number = good confidence on the rating accuracy. Like kFactor
    rd: kFactor * 4.69,
    //vol : Default volatility (expected fluctation on the player rating)
    vol: 0.06
};
var ranking = new glicko2.Glicko2(settings);

// canvas
const { registerFont, createCanvas, loadImage } = require("canvas");

const { joinVoiceChannel } = require("@discordjs/voice");

const fs = require("fs");

const wait = require("util").promisify(setTimeout);

// node-tesseract-ocr
// textract
// BASIC OCR THING (can remove later)

// Test is the queue array (FOR DOUBLES)
let partyQueue = [];
let userQueue = [];

let test = [];

let rateLimit = [];

let isRateLimit = [];

// numQueue is the number of people in the queue
let numQueue = 0;

// Reports is the number of report channels in an instance
let reports = [];
let support = [];

// Voided is the people who sent the command =void.
let voided = [];

// Scoring is the people who are waiting for games to be scored.
let scoring = [];

// Giveaway is a 2d array that contains the giveaway ID and the users in it
let giveaway = [];

// Cooldown is the queue ping cooldown
let cooldown = [];

// Teams are the teams for each game
let teams = [];

// in-game tests whether person is in-game or not
let ingame = [];

// Pending party is when someone sends a party invite and is waiting for the other person to accept.
let pendingParty = [];

// parties are all the parties
let parties = [];

// partyid is the id of the party
let partyId = [];

// ELO range is the elo range in which the bot will match two players.
const range = 25;

// ismoving is an array of when an user is being moved
let isMoving = [];

// Buttons, actions, etc. For latest version of Discord.JS.
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
let gamesE = 0;
let playersE = 0;

// Queue channel
const mainChannel = '931558312946856017';
const testingChannel = '931558312946856017';

// Connection variables (changes as needed)
var con = mysql.createPool({
    connectionLimit: 100,
    host: host,
    user: username,
    password: password,
    database: database,
    debug: false,
});

// When the bot starts up.
client.once("ready", () => {
    try {
        const data = fs.readFileSync("./blacklist.txt", 'utf8');
        let key = "\n";
        const split_string = data.split(key);
        for (var i = 0; i < split_string.length; i++) {
            let newWord = split_string[i];
            let newSplit = split_string[i].split("\n");
            if (newSplit[0] != "" && newSplit[0]) {
                let splitNew = newSplit[0].split(" ");
                blacklist.push(splitNew[0]);
            } else if (newSplit[1] != "" && newSplit[1]) {
                let splitNew = newSplit[1].split(" ");
                blacklist.push(splitNew[0]);
            }
        }
        console.log("Updated the blacklist.");
    } catch (e) {
        console.error(e);
    }
    console.log(`Logged in as ${client.user.tag}!`);

    logFile("=======================================");
    logFile("Ranked Bridge started up!");
    con.query(`SELECT * FROM games`, (err, rows) => {
        console.log("Number of games: " + (rows[rows.length - 1].gameid));
        gamesE = rows[rows.length - 1].gameid;
        con.query(`SELECT * FROM rbridge`, (err, rowes) => {
            console.log("Number of players: " + rowes.length);
            playersE = rowes.length;
            setInterval(() => {
                let activities = [
                    ".gg/rankedbridge",
                ];
                /*
                const randomIndex = Math.floor(
                  Math.random() * (activities.length - 1) + 1
                );
                */
                const newActivity = activities[0];
                client.user.setPresence({
                    status: "online",
                    activities: [
                        {
                            name: newActivity,
                            type: "STREAMING",
                        },
                    ],
                });
            }, 5000);
        });
    });
});

// When an user joins the server.
client.on("guildMemberAdd", (member) => {
    // Create an embed
    const helpEmbed = new Discord.MessageEmbed()
        .setColor("#2f3136")
        .setTitle("Welcome " + member.user.username + "!")
        .setDescription(
            "Please visit <#877244968564039711> and <#877038997908627476> before registering!"
        )
        .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
        .setThumbnail("https://media.giphy.com/media/yoVPoF08mSummEFQil/giphy-downsized-large.gif")
        .addFields({
            name: "Register using `=register <in-game username>`.",
            value:
                "If you have trouble registering, create a ticket in <#883481696853458964>. View the gif to make sure that you are registering correctly before opening a ticket.",
        })
        .setTimestamp();
    // Send the embed in the specific channel.
    member.guild.channels.cache.get(registerChannel).send({ embeds: [helpEmbed] });

    var role = member.guild.roles.cache.find(
        (role) => role.name === "Unverified"
    );

    member.roles.add(role);

    con.query(`SELECT * FROM banned WHERE id = '${member.id}'`, (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
            logFile(member.user.username + " joined.");
            console.log("User joined but isn't banned.");
            return;
        } else {
            var roleBan = member.guild.roles.cache.find(
                (role) => role.name === "Banned"
            );
            member.roles.add(roleBan);
            member.roles.remove(role);

            console.log("User joined and was banned. Added role to user.");
            logFile(member.user.username + " joined (was banned).");
        }
    });
    con.query(`SELECT * FROM leveling WHERE id='${member.id}'`, (err, rows) => {
        if (rows.length < 1) {
            console.log("User isn't in the leveling database. Inserting them...");
            sql = `INSERT INTO leveling(id, exp) VALUES('${member.id}', 0)`;
            con.query(sql);
            logFile("Inserted " + member.id + " into the leveling table.");
            return;
        } else {
            return;
        }
    });
});

client.on("guildMemberRemove", (member) => {
    console.log(member.user.username + " left.");
    logFile(member.user.username + " left.");
});

client.on('modalSubmit', async (interaction) => {
    if (interaction.customId.includes("suggest")) {
        await interaction.deferReply({ ephemeral: true });
        const firstResponse = interaction.components[0].value;
        console.log(interaction.member.user.username + " made the suggestion " + firstResponse);
        if (firstResponse && interaction.member.id != "877315883859603466") {

            let msgThing = interaction.customId.split("-");
            let mId = msgThing[1];
            interaction.channel.messages.fetch(mId).then(message => message.delete()).catch(console.error);

            const suggestEmbed = new Discord.MessageEmbed()
                .setColor("#99ffb3")
                .setTitle("Suggestion by " + interaction.member.user.username)
                .setDescription(firstResponse)
                .setTimestamp();

            const discuss = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("discuss")
                    .setLabel("Discuss")
                    .setStyle("PRIMARY")
            );

            const makeSuggest = new Discord.MessageEmbed()
                .setColor("#99ffb3")
                .setTitle("Make a Suggestion")
                .setDescription("If you wish to make a suggestion, click the button below! **Joke suggestions will get removed.**")
                .setTimestamp();

            const reactionEmoji = interaction.guild.emojis.cache.find(emoji => emoji.name === 'thumbsup');
            const reactionEmoji2 = interaction.guild.emojis.cache.find(emoji => emoji.name === 'thumbsdown');
            interaction.guild.channels.cache.get(suggestionsChannel).send({ embeds: [suggestEmbed], components: [discuss] }).then(m => {
                m.react("👍");
                m.react("👎");
            }).catch((err) => console.error(err));
            interaction.guild.channels.cache.get(suggestionsChannel).send({ embeds: [makeSuggest] }).then((msg) => {
                setTimeout(() => {
                    let msgId = msg.id;
                    const row = new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId("suggest-" + msgId)
                            .setLabel("Make a Suggestion")
                            .setStyle("SUCCESS")
                    );
                    msg.edit({ components: [row] }).catch((err) => console.error(err));
                    interaction.editReply("Submitted your suggestion!");
                }, 2000);
            }).catch((err) => console.error(err));
        }
    }

    if (interaction.customId === 'support') {
        const firstResponse = interaction.components[0].value;
        await interaction.deferReply({ ephemeral: true });
        con.query(`SELECT * FROM tickets WHERE id='${interaction.member.id}'`, async (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                let title = "support-" + interaction.user.username.toLowerCase();

                interaction.guild.channels.create(title, {
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"], //Deny permissions
                        },
                        {
                            // But allow the two users to view the channel, send messages, and read the message history.
                            id: interaction.user.id,
                            allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
                        },
                        {
                            // But allow the two users to view the channel, send messages, and read the message history.
                            id: staff,
                            allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
                        },
                    ],
                }).then(async (channel) => {
                    con.query(`INSERT INTO tickets (channelid, id) VALUES ('${channel.id}', '${interaction.member.id}')`, async (err, rows) => {
                        if (err) throw err;
                        const createdEmbed = new Discord.MessageEmbed()
                            .setColor("#83cf5d")
                            .setTitle(`Created Ticket`)
                            .setDescription("Opened a new ticket: <#" + channel.id + ">")
                            .setTimestamp();
                        const channelEmbed = new Discord.MessageEmbed()
                            .setColor("#5d9acf")
                            .setTitle(`Support`)
                            .setDescription("Thank you for opening a support ticket on Ranked Bridge! If there is any way that we can assist you, please state it below and we will be glad to help! Regarding Staff/Scorer applications, Staff will send you a Google Document for you to fill out. We are working on automating the process for applications, so please be patient as we work on developing that!\n`Reason:`\n```" + firstResponse + "```")
                            .setTimestamp();
                        await interaction.followUp({ embeds: [createdEmbed] });
                        await interaction.guild.channels.cache.get(channel.id).send({ embeds: [channelEmbed] });
                    });
                });
            } else {
                let channelThing = interaction.guild.channels.cache.find((c) => c.name === "support-" + interaction.user.username.toLowerCase());
                if (!channelThing) {
                    con.query(`DELETE FROM tickets WHERE id='${rows[0].id}'`, async (erre, rowse) => {
                        if (erre) throw erre;
                        let title = "support-" + interaction.user.username.toLowerCase();

                        interaction.guild.channels.create(title, {
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"], //Deny permissions
                                },
                                {
                                    // But allow the two users to view the channel, send messages, and read the message history.
                                    id: interaction.user.id,
                                    allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
                                },
                                {
                                    // But allow the two users to view the channel, send messages, and read the message history.
                                    id: staff,
                                    allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
                                },
                            ],
                        }).then(async (channel) => {
                            con.query(`INSERT INTO tickets (channelid, id) VALUES ('${channel.id}', '${interaction.member.id}')`, async (err, rows) => {
                                if (err) throw err;
                                const createdEmbed = new Discord.MessageEmbed()
                                    .setColor("#83cf5d")
                                    .setTitle(`Created Ticket`)
                                    .setDescription("Opened a new ticket: <#" + channel.id + ">")
                                    .setTimestamp();
                                const channelEmbed = new Discord.MessageEmbed()
                                    .setColor("#5d9acf")
                                    .setTitle(`Support`)
                                    .setDescription("Thank you for opening a support ticket with Bridge Scrims! If there is any way that we can assist you, please state it below and we will be glad to help!\n`Reason:`\n```" + firstResponse + "```")
                                    .setTimestamp();
                                await interaction.followUp({ embeds: [createdEmbed] });
                                await interaction.guild.channels.cache.get(channel.id).send({ embeds: [channelEmbed] });
                            });
                        });
                    });
                } else {
                    const channelEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(`Error!`)
                        .setDescription("You already have a ticket open (<#" + channelThing.id + ">).")
                        .setTimestamp();
                    await interaction.editReply({ embeds: [channelEmbed] });
                }
            }
        });
    }
})

client.on("interactionCreate", async (interaction) => {

    if (interaction.isAutocomplete()) {
        if (interaction.options._hoistedOptions[2] === undefined) {
            let focusedOption = interaction.options.getFocused().toString();
            con.query(`SELECT * FROM rbridge WHERE name LIKE '${focusedOption}%' LIMIT 10`, (err, rows) => {
                if (err) return;
                if (!rows || rows.length < 1) return;
                let options = rows.map((row) => ({
                    name: row.name,
                    value: row.id,
                }));
                interaction.respond(options).catch((err) => console.error(err));
            });
        }
        if (interaction.options._hoistedOptions[2] != undefined && interaction.options._hoistedOptions[2].name === "format") {
            let options = [
                { name: "Seconds", value: "Seconds" },
                { name: "Minutes", value: "Minutes" },
                { name: "Hours", value: "Hours" },
                { name: "Days", value: "Days" },
                { name: "Permanent", value: "Permanent" }
            ];
            interaction.respond(options).catch((err) => console.error(err));
        }
    }

    if (interaction.isCommand()) {
        if (interaction.commandName === "ping") {
            interaction.reply("Pong!");
        }

        if (interaction.commandName === "screenshare") {
            const user = interaction.options.getString('target');
            if (!user) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You need to provide a valid user!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply({ embeds: [notSetEmbed], files: [file], ephemeral: true });
                return;
            }
            con.query(`SELECT * FROM rbridge WHERE id = ?`, [user], function (err, rows, fields) {
                if (rows.length < 1) {
                    console.log("User doesn't exist!");
                    const file = new MessageAttachment(
                        "../container/caution_gif.gif"
                    );
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("That user doesn't exist!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    interaction.reply({ embeds: [notSetEmbed], files: [file], ephemeral: true });
                    return;
                } else {
                    createScreenshareChannel(interaction, interaction.member.id, rows[0].id);
                }
            });
        }

        if (interaction.commandName === "info") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply({ embeds: [notSetEmbed], files: [file], ephemeral: true });
                return;
            } else {
                const memberThing = interaction.options.getUser('target');
                if (!memberThing) {
                    interaction.reply("You need to provide an user!");
                    return;
                }

                const testThing = interaction.options.getString('test');
                console.log(testThing);

                // Credit to Random Guy on stack
                // https://stackoverflow.com/questions/65965869/discord-js-v12-user-info-command
                const moment = require('moment');
                let member = await interaction.guild.members.fetch(memberThing.id).catch(() => null);
                if (!member) {
                    interaction.reply("Can't get that user. Maybe they left?");
                } else {
                    let status = "None";
                    if (member.user.presence != undefined) {
                        status = member.user.presence.status;
                    }
                    const uiembed = new MessageEmbed()
                        .setTitle(`${member.displayName}'s Information`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .addField('User', "`" + member.user.username + "`", true)
                        .addField('Discriminator', `\`#${member.user.discriminator}\``, true)
                        .addField('ID', `\`${member.id}\``, true)
                        .addField('Bot', `\`${member.user.bot}\``, true)
                        .addField('User\'s Status: ', `\`${status}\``, true)
                        .addField('Color Role', "<@&" + member.roles.color + ">", true)
                        .addField('Highest Role', "<@&" + member.roles.highest + ">", true)
                        .addField('Joined server on', `\`${moment(member.joinedAt).format('MMM DD YYYY')}\``, true)
                        .addField('Joined Discord on', `\`${moment(member.user.createdAt).format('MMM DD YYYY')}\``, true)
                        .setFooter({
                            text: "interaction.member.displayName", iconURL: interaction.member.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTimestamp()
                        .setColor(member.displayHexColor);
                    interaction.reply({ embeds: [uiembed], ephemeral: true });
                }
            }
        }
        if (interaction.commandName === "mute") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getUser('target');
                    const time = interaction.options.getInteger('time');
                    const reasonSome = interaction.options.getString('reason');
                    const timeFormat = interaction.options.getString('format');
                    if (timeFormat != "Days" && timeFormat != "Hours" && timeFormat != "Seconds" && timeFormat != "Permanent" && timeFormat != "Minutes") {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide a valid time format!")
                            .setDescription("Example: `/ban Eltik 1 Days`")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }

                    let reason;
                    if (!reasonSome) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonSome;
                    }
                    if (!user) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    if (!time) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide a time!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    muteUser(interaction, user, time, timeFormat, reason);
                }
            }
        }

        if (interaction.commandName === "unmute") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getUser('target');

                    if (!user) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    con.query(`SELECT * FROM muted WHERE id = '${user.id}'`, async (erre, rows) => {
                        if (erre) throw erre;
                        if (rows.length < 1) {
                            const file = new MessageAttachment("../container/caution_gif.gif");
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("That user isn't muted!")
                                .setDescription("You can only unmute users who are already muted.")
                                .setThumbnail("attachment://caution_gif.gif")
                                .setTimestamp();
                            // Send the embd.
                            interaction.reply({ embeds: [notSetEmbed], files: [file] });
                            return;
                        } else {
                            let mention = await interaction.guild.members.fetch(user.id).catch(() => null);
                            logFile(user.username + " is unmuted.");
                            let name = user.username;
                            con.query(`DELETE FROM muted WHERE id = '${user.id}'`, (erre, row) => {
                                if (erre) throw erre;
                            });
                            if (!mention) {
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle(name + " is now unmuted.")
                                    .setTimestamp();
                                // Send the embed.
                                interaction.reply({ embeds: [notSetEmbed] });
                                interaction.guild.channels.cache
                                    .get(punishmentsChannel)
                                    .send({ embeds: [notSetEmbed] });
                                return;
                            } else {
                                mention.roles.remove(muted);
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle(name + " is now unmuted.")
                                    .setTimestamp();
                                // Send the embed.
                                interaction.reply({ embeds: [notSetEmbed] });
                                interaction.guild.channels.cache
                                    .get(punishmentsChannel)
                                    .send({ embeds: [notSetEmbed] });
                            }
                        }
                    });
                }
            }
        }

        if (interaction.commandName === "freeze") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Screensharer")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                var role = interaction.member.guild.roles.cache.find(
                    (role) => role.id === frozen
                );
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getString('target');
                    if (!user) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide a valid user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    let member = await interaction.guild.members.fetch(user).catch(() => null);
                    if (!member) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setDescription("Maybe they left?")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                    } else {
                        member.roles.add(role);
                        member.roles.add(unverified);
                        member.roles.remove(rankedPlayer);
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Froze " + member.user.username + ".")
                            .setTimestamp();
                        // Send the embed.
                        interaction.reply({ embeds: [notSetEmbed] });
                    }
                }
            }
        }

        if (interaction.commandName === "unfreeze") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Screensharer")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                var role = interaction.member.guild.roles.cache.find(
                    (role) => role.id === frozen
                );
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getString('target');
                    if (!user) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    let member = await interaction.guild.members.fetch(user).catch(() => null);
                    if (!member) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setDescription("Maybe they left?")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                    } else {
                        member.roles.add(rankedPlayer);
                        member.roles.remove(unverified);
                        member.roles.remove(role);

                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Unfroze " + member.user.username + ".")
                            .setTimestamp();
                        // Send the embed.
                        interaction.reply({ embeds: [notSetEmbed] });
                    }
                }
            }
        }

        if (interaction.commandName === "warn") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getUser('target');
                    const reasonSome = interaction.options.getString('reason');
                    if (!user) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    let id = user.id;
                    let reason;
                    if (!reasonSome) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonSome;
                    }
                    warnUser(interaction, user, id, reason);
                }
            }
        }

        if (interaction.commandName === "forceban") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Moderator") && !interaction.member.roles.cache.some((r) => r.name === "Admin")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                if (interaction.options.getSubcommand() === 'user') {
                    const target = interaction.options.getUser('target');
                    const reasonSome = interaction.options.getString('reason');
                    let reason;
                    if (!reasonSome) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonSome;
                    }
                    if (!target) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    let mention = await interaction.guild.members.fetch(target.id).catch(() => null);
                    if (!mention) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Couldn't get that user!")
                            .setDescription("Maybe they left?")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    interaction.guild.members.ban(target.id);
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Banned " + target.username + " permanently.")
                        .setDescription("Reason: `" + reason + "`")
                        .setTimestamp();
                    // Send the embd.
                    interaction.reply({ embeds: [notSetEmbed] });
                    interaction.guild.channels.cache.get(bansChannel).send({ embeds: [notSetEmbed] });
                }
            }
        }

        if (interaction.commandName === "ban") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Moderator") && !interaction.member.roles.cache.some((r) => r.name === "Admin")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                let reason;
                if (interaction.options.getSubcommand() === 'user') {
                    const target = interaction.options.getString('target');
                    const time = interaction.options.getInteger('time');
                    const timeFormat = interaction.options.getString('format');
                    if (timeFormat != "Days" && timeFormat != "Hours" && timeFormat != "Seconds" && timeFormat != "Permanent" && timeFormat != "Minutes") {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide a valid time format!")
                            .setDescription("Example: `/ban Eltik 1 Days`")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }

                    const reasonProvided = interaction.options.getString('reason');
                    if (!reasonProvided) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonProvided;
                    }

                    if (!interaction.member.roles.cache.some((r) => r.name === "Moderator") && !interaction.member.roles.cache.some((r) => r.name === "Admin")) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You don't have permission to use this command!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        await interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    } else {
                        con.query(`SELECT * FROM rbridge WHERE id = '${target}'`, (err, rows) => {
                            if (err) throw err;
                            if (rows.length < 1) {
                                const file = new MessageAttachment(
                                    "../container/caution_gif.gif"
                                );
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Error!")
                                    .setDescription("Couldn't get " + target + " in the database.")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                interaction.reply({ embeds: [notSetEmbed], files: [file] });
                                return;
                            } else {
                                banUser(interaction, rows[0].name, time, timeFormat, reason);
                            }
                        });
                    }
                }
            }
        }

        if (interaction.commandName === "unban") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Moderator") && !interaction.member.roles.cache.some((r) => r.name === "Admin")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                let reason;
                if (interaction.options.getSubcommand() === 'user') {
                    const target = interaction.options.getString('target');
                    if (!target) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to provide an user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }

                    const reasonProvided = interaction.options.getString('reason');
                    if (!reasonProvided) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonProvided;
                    }

                    if (!interaction.member.roles.cache.some((r) => r.name === "Moderator") && !interaction.member.roles.cache.some((r) => r.name === "Admin")) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You don't have permission to use this command!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        await interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    } else {
                        con.query(`SELECT * FROM rbridge WHERE id = '${target}'`, (err, rowes) => {
                            if (err) throw err;
                            if (rowes.length < 1) {
                                const file = new MessageAttachment(
                                    "../container/caution_gif.gif"
                                );
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Error!")
                                    .setDescription("Couldn't get " + target + " in the database.")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                interaction.reply({ embeds: [notSetEmbed], files: [file] });
                                return;
                            } else {
                                con.query(`SELECT * FROM banned WHERE id = '${target}'`, (erre, rowse) => {
                                    if (erre) throw erre;
                                    if (rowse.length < 1) {
                                        const file = new MessageAttachment(
                                            "../container/caution_gif.gif"
                                        );
                                        const notSetEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Error!")
                                            .setDescription(target + " isn't banned!")
                                            .setThumbnail("attachment://caution_gif.gif")
                                            .setTimestamp();
                                        // Send the embd.
                                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                                        return;
                                    } else {
                                        const notSetEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle(rowes[0].name + " is now unbanned.")
                                            .setDescription("User: <@" + rowes[0].id + ">\nReason: ```" + reason + "```")
                                            .setTimestamp();
                                        var user1 = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                                            logFile(rowes[0].name + " is unbanned.");
                                            con.query(`DELETE FROM banned WHERE id = '${rowes[0].id}'`, (erre, row) => {
                                                if (erre) throw erre;
                                            });
                                            user.roles.remove(banned);
                                            var role = interaction.guild.roles.cache.find(
                                                (role) => role.name === "Unverified"
                                            );
                                            user.roles.add(role);
                                            const notSetEmbed = new Discord.MessageEmbed()
                                                .setColor("#2f3136")
                                                .setTitle(rowes[0].name + " is now unbanned.")
                                                .setDescription("User: <@" + rowes[0].id + ">\nReason: ```" + reason + "```")
                                                .setTimestamp();
                                            // Send the embed.
                                            interaction.guild.channels.cache.get(bansChannel).send({ embeds: [notSetEmbed] });
                                            interaction.reply({ embeds: [notSetEmbed] });
                                            return;
                                        }).catch((e) => {
                                            con.query(`DELETE FROM banned WHERE id = '${rowes[0].id}'`, (erre, row) => {
                                                if (erre) throw erre;
                                            });
                                            interaction.guild.channels.cache.get(bansChannel).send({ embeds: [notSetEmbed] })
                                            interaction.reply({ embeds: [notSetEmbed] });
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }

        if (interaction.commandName === "score") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Scorer")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                let reason;
                if (interaction.channel != undefined) {
                    if (!interaction.channel.name.includes("game-")) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You need to send this in a game channel!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                }

                let nameSplit = interaction.channel.name.split("-");
                let gameNumThing = nameSplit[1];
                if (interaction.options.getSubcommand() === 'user') {
                    const winner = interaction.options.getString('winner');
                    const loser = interaction.options.getString('loser');
                    const winnerScore = interaction.options.getInteger('winner_score');
                    const loserScore = interaction.options.getInteger('loser_score');

                    if (winnerScore > 5 || winnerScore < 1) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Please provide a valid winner score!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    if (loserScore > 4 || loserScore < 0) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Please provide a valid loser score!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }

                    var scorerRole = interaction.guild.roles.cache.find((role) => role.name === "Scorer");
                    if (!interaction.member.roles.cache.has(scorerRole.id)) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You don't have permission to use this command!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        await interaction.editReply({ embeds: [notSetEmbed], files: [file] });
                    } else {
                        if (winner && loser) {
                            calcElo(interaction, winner, loser, winnerScore, loserScore, gameNumThing);
                        } else {
                            const file = new MessageAttachment("../container/caution_gif.gif");
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("Couldn't find one of those users!")
                                .setThumbnail("attachment://caution_gif.gif")
                                .setTimestamp();
                            // Send the embd.
                            await interaction.editReply({ embeds: [notSetEmbed], files: [file] });
                            return;
                        }
                    }
                }
            }
        }

        if (interaction.commandName === 'kick') {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                let reason;
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getUser('target');
                    const reasonSome = interaction.options.getString('reason');
                    if (!reasonSome) {
                        reason = 'No reason provided.';
                    } else {
                        reason = reasonSome;
                    }

                    var staffRole = interaction.guild.roles.cache.find((role) => role.name === "Staff");
                    if (!interaction.member.roles.cache.has(staffRole.id)) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You don't have permission to use this command!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    } else {
                        if (user) {
                            let testOtherMemberGet = interaction.guild.members.fetch(user.id).then(async (userSome) => {
                                if (user) {
                                    if (userSome.roles.cache.has(staffRole.id)) {
                                        const file = new MessageAttachment("../container/caution_gif.gif");
                                        const notSetEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Can't kick that user!")
                                            .setThumbnail("attachment://caution_gif.gif")
                                            .setTimestamp();
                                        // Send the embd.
                                        interaction.reply({ embeds: [notSetEmbed], files: [file] });
                                        return;
                                    }
                                    const notSetEmbed = new Discord.MessageEmbed()
                                        .setColor("#2f3136")
                                        .setTitle(user.username + " was kicked.")
                                        .setDescription("Reason: `" + reason + "`")
                                        .setTimestamp();
                                    interaction.reply({ embeds: [notSetEmbed] })
                                    // Send the embed.
                                    interaction.guild.channels.cache.get(punishmentsChannel).send({ embeds: [notSetEmbed] });
                                    userSome.kick();
                                }
                            }).catch((err) => console.error(err));;
                        } else {
                            const file = new MessageAttachment("../container/caution_gif.gif");
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("You can't kick yourself!")
                                .setThumbnail("attachment://caution_gif.gif")
                                .setTimestamp();
                            // Send the embd.
                            await interaction.editReply({ embeds: [notSetEmbed], files: [file] });
                            return;
                        }
                    }
                }
            }
        }

        if (interaction.commandName === 'strike') {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
                if (interaction.options.getSubcommand() === 'user') {
                    const user = interaction.options.getString('target');
                    const reasonSome = interaction.options.getString('reason');

                    let reason;
                    if (!reasonSome) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonSome;
                    }
                    if (user) {
                        con.query(`SELECT * FROM rbridge WHERE id = '${user}'`, async (err, rowes) => {
                            if (rowes.length < 1) {
                                const file = new MessageAttachment("../container/caution_gif.gif");
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Couldn't find <@" + user + "> in the database!")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                await interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                            } else {
                                strike(interaction, rowes[0].name, reason);
                            }
                        });
                    } else {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Please provide a valid user!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        await interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                    }
                }
            }
        }

        if (interaction.commandName === "forceclose") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setTimestamp();
                // Send the embd.
                await interaction.reply(({ embeds: [notSetEmbed], files: [file] }));
                return;
            } else {
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
            }
        }
        if (interaction.commandName === "close") {
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setTimestamp();
                // Send the embd.
                await interaction.reply(({ embeds: [notSetEmbed] }));
                return;
            } else {
                if (interaction.options.getSubcommand() === 'reason') {
                    const reasonSome = interaction.options.getString('reason');
                    let reason;
                    if (!reasonSome) {
                        reason = "No reason provided.";
                    } else {
                        reason = reasonSome;
                    }
                    transcribe(interaction.channel.id, "<b>" + interaction.member.user.username + "</b> sent a close request with the reason " + reason + ".");
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
                            const closeButton = new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setCustomId("deny-" + rows[0].id)
                                    .setLabel("❌ Deny & Keep Open")
                                    .setStyle("PRIMARY")
                            );
                            const openButton = new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setCustomId("accept-" + rows[0].id)
                                    .setLabel("✅ Accept & Close")
                                    .setStyle("PRIMARY")
                            );
                            const embed = new Discord.MessageEmbed()
                                .setColor("#5d9acf")
                                .setTitle("Close Request")
                                .setDescription("<@" + interaction.member.id + "> has requested to close this ticket. Reason:\n```" + reason + "```\nPlease accept or deny using the buttons below.")
                                .setTimestamp();
                            await interaction.reply("<@" + rows[0].id + ">");
                            await interaction.channel.send({ embeds: [embed], components: [openButton, closeButton] });
                        }
                    });
                }
            }
        }

        if (interaction.commandName === 'delete') {
            await interaction.deferReply();
            if (!interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Only staff can delete channels!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                await interaction.editReply(({ embeds: [notSetEmbed], files: [file] }));
            } else {
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("delete-" + interaction.member.id)
                        .setLabel("Yes")
                        .setStyle("SUCCESS")
                );
                const scoreEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Are you sure you want to delete this channel?")
                    .setTimestamp();
                await interaction.editReply(({ components: [row], embeds: [scoreEmbed] }));
            }
        }

        if (interaction.commandName === 'saturday') {
            await interaction.deferReply({ ephemeral: true });
            if (interaction.member.roles.cache.some((r) => r.name === "Staff")) {
                if (kFactor === 16) {
                    kFactor = 32;
                    saturday = true;

                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Double ELO is turned on.")
                        .setTimestamp();
                    // Send the embd.
                    await interaction.editReply(({ embeds: [notSetEmbed] }));
                } else if ((kFactor = 32)) {
                    kFactor = 16;
                    saturday = false;
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Double ELO is turned off.")
                        .setTimestamp();
                    // Send the embd.
                    await interaction.editReply(({ embeds: [notSetEmbed] }));
                } else {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Invalid k factor. Contact Eltik!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    await interaction.editReply(({ embeds: [notSetEmbed], files: [file] }));
                    console.log("Invalid k factor.");
                }
            } else {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                await interaction.editReply(({ embeds: [notSetEmbed], files: [file] }));
            }
        }

        if (interaction.commandName === 'server') {
            const serverLogo = interaction.guild.iconURL();
            const serverBanner = interaction.guild.bannerURL();
            let vanityURL = "https://discord.gg/" + interaction.guild.vanityURLCode;
            if (!vanityURL) {
                vanityURL = "NONE";
            }

            let featureArray = interaction.guild.features;
            let features = "";
            for (let i = 0; i < featureArray.length; i++) {
                if (i === 0) {
                    features = featureArray[i];
                } else {
                    features = features + ", " + featureArray[i];
                }
            }

            const serverEmbed = new Discord.MessageEmbed()
                .setTitle(interaction.guild.name)
                .setImage(serverBanner)
                .setThumbnail(serverLogo)
                .setDescription("**[`" + interaction.guild.description + "`]**")
                .addField("**Booster Level:**", `\`${interaction.guild.premiumTier}\``)
                .addField("**Date Created:**", `\`${interaction.guild.createdAt.toLocaleString()}\``)
                .addField("**Owner:**", "`Unknown`")
                .addField("**Rules Channel:**", `<#` + interaction.guild.rulesChannelId + ">")
                .addField("**Member Count:**", `\`${interaction.guild.memberCount}\``)
                .addField("**Roles Count:**", `\`${interaction.guild.roles.cache.size}\``)
                .addField("**Channels Count:**", `\`${interaction.guild.channels.cache.size}\``)
                .addField("**Number of players registered:**", `\`${playersE}\``)
                .addField("**Number of games played:**", `\`${gamesE}\``)
                .addField("**Features:**", `\`${features}\``)
                .addField("**Preferred Timezone:**", `\`${interaction.guild.preferredLocale}\``)
                .addField("**Vanity URL:**", `${vanityURL}`)
                .setURL(serverLogo)
            await interaction.reply({ embeds: [serverEmbed] });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId.includes("report")) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply("Currently under development!");
        }
        if (interaction.customId.includes("deny")) {
            await interaction.deferReply({ ephemeral: true });
            let splitID = interaction.customId.split("-");
            let userID = splitID[1];
            if (userID != interaction.member.id) {
                const errorEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(`Error!`)
                    .setDescription("Only <@" + userID + "> can close this ticket. If you are Staff, use `/forceclose`.")
                    .setTimestamp();
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                transcribe(interaction.channel.id, "<b>" + interaction.member.user.username + "</b> denied the close request.");
                await interaction.editReply("Denied close request.");
                const embed = new Discord.MessageEmbed()
                    .setColor("#ff2445")
                    .setTitle(`Close Request Denied`)
                    .setDescription("<@" + interaction.member.id + "> has denied the close request.")
                    .setTimestamp();
                interaction.message.edit({ embeds: [embed], components: [] });
            }
        }
        if (interaction.customId === "support") {
            const modal = new Modal() // We create a Modal
                .setCustomId('support')
                .setTitle('Support Ticket')
                .addComponents(
                    new TextInputComponent() // We create an Text Input Component
                        .setCustomId('support')
                        .setLabel('Reason for opening a ticket')
                        .setStyle('LONG') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                        .setMinLength(5)
                        .setMaxLength(2000)
                        .setPlaceholder('Write here')
                        .setRequired(true) // If it's required or not
                        .setValue('value')
                );
            showModal(modal, {
                client: client, // The showModal() method needs the client to send the modal through the API.
                interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
            })
        }

        if (interaction.customId.includes("accept")) {
            await interaction.deferReply({ ephemeral: true });
            let splitID = interaction.customId.split("-");
            let userID = splitID[1];
            if (userID != interaction.member.id) {
                const channelEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(`Error!`)
                    .setDescription("Only <@" + userID + "> can close this ticket. If you are Staff, use `/forceclose`.")
                    .setTimestamp();
                await interaction.editReply({ embeds: [channelEmbed] });
            } else {
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
                        transcribe(interaction.channel.id, "<b>" + interaction.member.user.username + "</b> accepted the close request.");
                        const cName = interaction.channel.name;
                        let splitThing = cName.split("-");
                        const idThing = rows[0].id;
                        sendTranscription(interaction, interaction.channel.id, splitThing[1], idThing);
                        con.query(`DELETE FROM tickets WHERE id='${interaction.member.id}'`, async (err, rows) => {
                            if (err) throw err;
                        });
                        interaction.channel.delete();
                    }
                });
            }
        }
        if (interaction.customId.includes("party")) {
            if (interaction.customId.includes(interaction.member.id)) {
                let otherMember;
                for (var i = 0; i < pendingParty.length; i++) {
                    if (pendingParty[i][1] === interaction.member.id) {
                        otherMember = pendingParty[i][0];
                    }
                    if (pendingParty[i][0] === interaction.member.id) {
                        otherMember = pendingParty[i][1];
                    }
                }
                for (var i = 0; i < parties.length; i++) {
                    if (parties[i][0] === otherMember || parties[i][1] === otherMember) {
                        await interaction.deferReply({ ephemeral: true });
                        await interaction.editReply("That person is already in a party!");
                        return;
                    }
                    if (
                        parties[i][0] === interaction.member.id ||
                        parties[i][1] === interaction.member.id
                    ) {
                        await interaction.deferReply({ ephemeral: true });
                        await interaction.editReply("You're already in a party!");
                        return;
                    }
                }
                if (
                    otherMember === undefined ||
                    otherMember === null ||
                    typeof otherMember === "undefined"
                ) {
                    await interaction.deferReply({ ephemeral: true });
                    await interaction.editReply(
                        "You don't have an invite to that person's party!"
                    );
                    return;
                }
                for (var i = 0; i < userQueue.length; i++) {
                    if (userQueue[i][0] === interaction.member.id || userQueue[i][0] === otherMember) {
                        userQueue.splice(i, 1);
                    }
                }

                let partyThingIdk;
                for (var i = 0; i < partyQueue.length; i++) {
                    let partyThing = partyQueue[i][0];
                    let spiceThing = partyThing.split(" ");
                    if (spiceThing[0] === interaction.member.id || spiceThing[1] === interaction.member.id || spiceThing[0] === otherMember || spiceThing[1] === otherMember || partyThing.includes(interaction.member.id) || partyThing.includes(otherMember)) {
                        console.log("Spliced the party queue thing. spice thing 0: " + spiceThing[0] + ". spice thing 1: " + spiceThing[1]);
                        if (spiceThing[0] === interaction.member.id || spiceThing[0] === otherMember) {
                            console.log("set partyThingidk to " + spiceThing[1]);
                            partyThingIdk = spiceThing[1];
                        } else if (spiceThing[1] === interaction.member.id || spiceThing[1] === otherMember) {
                            console.log("set partyThingidk to " + spiceThing[0]);
                            partyThingIdk = spiceThing[0];
                        }
                        partyQueue.splice(i, 1);
                    }
                }

                pendingParty.splice(i, 1);
                parties.push([
                    otherMember,
                    interaction.member.id,
                    otherMember + " " + interaction.member.id,
                ]);
                partyId.push("something");
                await interaction.deferReply({ ephemeral: true });
                logFile(
                    interaction.member.user.tag +
                    " accepted party invite from " +
                    otherMember +
                    "."
                );
                if (interaction.member.voice) {
                    if (interaction.member.voice.channel) {
                        if (interaction.member.voice.channel.id === mainChannel) {
                            interaction.member.voice.disconnect();
                        }
                    }
                }
                let otherMemberGet = await interaction.guild.members.fetch(otherMember).then(async (user) => {
                    if (user.voice) {
                        if (user.voice.channel) {
                            if (user.voice.channel.id === mainChannel) {
                                user.voice.disconnect();
                            }
                        }
                    }
                }).catch((error) => console.error(error));
                await interaction.editReply("Accepted party invite!");
                await interaction.channel.send(
                    "<@" +
                    otherMember +
                    ">, " +
                    interaction.member.user.tag +
                    " accepted the party invite."
                );
            } else {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply("You don't have an invite from that person!");
            }
        }

        if (interaction.customId.includes("invisible")) {
            addInvisible(interaction, interaction.guild, interaction.member);
        }

        if (interaction.customId.includes("dont-ping")) {
            addDontPing(interaction, interaction.guild, interaction.member);
        }

        if (interaction.customId.includes("giveaway")) {
            let idSplit = interaction.customId.split("-");
            console.log(idSplit);
            let giveawayId = idSplit[1];
            await interaction.deferReply({ ephemeral: true });
            for (var i = 0; i < giveaway.length; i++) {
                if (giveaway[i][0] === interaction.member.id && giveaway[i][1] === giveawayId) {
                    await interaction.editReply("You already entered this giveaway!");
                    return;
                }
            }
            await giveaway.push([interaction.member.id, giveawayId]);
            await interaction.editReply("Entered you into the giveaway.");
        }

        if (interaction.customId.includes("delete")) {
            let idSplit = interaction.customId.split("-");
            if (idSplit[1] === interaction.member.id) {
                interaction.channel.delete();
            } else {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply("<@" + idSplit[1] + "> has to accept this channel delete!");
            }
        }

        if (interaction.customId.includes("suggest")) {
            let msgThing = interaction.customId.split("-");
            let mId = msgThing[1];
            const modal = new Modal() // We create a Modal
                .setCustomId('suggest-' + mId)
                .setTitle('Make a Suggestion')
                .addComponents(
                    new TextInputComponent() // We create an Text Input Component
                        .setCustomId('suggest-' + mId)
                        .setLabel('Suggestion')
                        .setStyle('LONG') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                        .setMinLength(5)
                        .setMaxLength(2000)
                        .setPlaceholder('Write your suggestion here...')
                        .setRequired(true) // If it's required or not
                        .setValue('value')
                );
            showModal(modal, {
                client: client, // The showModal() method needs the client to send the modal through the API.
                interaction: interaction // The showModal() method needs the interaction to send the modal with the Interaction ID & Token.
            })
        }

        if (interaction.customId === "discuss") {
            await interaction.deferReply({ ephemeral: true });
            if (!interaction.message.hasThread) {
                interaction.message.startThread({
                    name: 'Discussion by ' + interaction.member.user.username,
                    autoArchiveDuration: 1440,
                    reason: 'Discussion',
                });
                await interaction.editReply("Started thread.");
            } else {
                await interaction.editReply("That suggestion already has a thread!");
            }
        }

        if (interaction.customId === "queue-ping") {
            await addQueuePing(interaction, interaction.guild, interaction.member);
        }

        if (interaction.customId === "announcement-ping") {
            await addAnnouncementPing(interaction, interaction.guild, interaction.member);
        }

        if (interaction.customId === "scorer-ping") {
            await addScorerPing(interaction, interaction.guild, interaction.member);
        }

        if (interaction.customId === "attacker") {
            await addRoleRole(interaction, "attacker", interaction.guild, interaction.member);
        }

        if (interaction.customId === "defender") {
            await addRoleRole(interaction, "defender", interaction.guild, interaction.member);
        }

        if (interaction.customId === "hybrid") {
            await addRoleRole(interaction, "hybrid", interaction.guild, interaction.member);
        }

        if (interaction.customId === "event-ping") {
            await addEventPing(interaction, interaction.guild, interaction.member);
        }

        if (interaction.customId === "blue") {
            await addRole(interaction, interaction.guild, interaction.member, "Blue");
        }

        if (interaction.customId === "red") {
            await addRole(interaction, interaction.guild, interaction.member, "Red");
        }

        if (interaction.customId === "green") {
            await addRole(interaction, interaction.guild, interaction.member, "Green");
        }

        if (interaction.customId === "purple") {
            await addRole(interaction.guild, interaction.member, "Purple");
        }

        if (interaction.customId === "pink") {
            await addRole(interaction.guild, interaction.member, "Pink");
        }

        if (interaction.customId === "orange") {
            await addRole(interaction, interaction.guild, interaction.member, "Orange");
        }

        if (interaction.customId === "yellow") {
            await addRole(interaction, interaction.guild, interaction.member, "Yellow");
        }

        if (interaction.customId === "creator") {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Created ticket!");
            await creatorChannel(interaction.guild, interaction.member.id);
        }

        if (interaction.customId === "void") {
            let j = 0;
            for (var i = 0; i < voided.length; i++) {
                if (interaction.channel) {
                    if (
                        (voided[i][0] === interaction.member.id &&
                            voided[i][1] === interaction.channel.name) ||
                        voided[i][2] === interaction.member.id
                    ) {
                        break;
                    } else {
                        j++;
                    }
                }
            }
            if (j < voided.length) {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply(
                    "One of your opponent have to agree to void the game!"
                );
                return;
            } else {
                if (
                    !interaction.member.voice.channel ||
                    !interaction.member.voice.channel.name.includes("Game")
                ) {
                    await interaction.deferReply({ ephemeral: true });
                    await interaction.editReply(
                        "You need to be connected to a voice channel! (to delete the channels)"
                    );
                } else {
                    for (var i = 0; i < voided.length; i++) {
                        if (voided[i][1] === interaction.channel.name) {
                            voided.splice(i, 1);
                        }
                    }
                    await interaction.deferReply({ ephemeral: true });
                    if (interaction.channel === null || interaction.channel === "null") {
                        console.log("Channel is null! Scam.");
                        return;
                    } else {
                        if (interaction.member.voice) {
                            if (interaction.member.voice.channel) {
                                var channelName = interaction.member.voice.channel.name;
                                var splitName = channelName.split(" ");
                                var channelNum = splitName[1];
                                var channel1 = interaction.member.guild.channels.cache.find(
                                    (c) => c.name === "Game " + channelNum + " Team 1"
                                );
                                var channel2 = interaction.member.guild.channels.cache.find(
                                    (c) => c.name === "Game " + channelNum + " Team 2"
                                );
                                channel1.delete().catch((err) => console.error(err));;
                                channel2.delete().catch((err) => console.error(err));;

                                for (var k = 0; k < ingame.length; k++) {
                                    if (ingame[k][1] === channelNum) {
                                        ingame.splice(k, 1);
                                    }
                                }
                                logFile("Voided game " + channelNum + ".");

                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Voided Game " + channelNum)
                                    .setTimestamp();
                                interaction.guild.channels.cache
                                    .get(gamesChannel)
                                    .send({ embeds: [notSetEmbed] });
                                interaction.channel.delete().catch((err) => console.error(err));;
                            }
                        }
                    }
                }
            }
        }

        if (interaction.customId === "score") {
            let j = 0;
            if (
                interaction.member.voice.channel === null ||
                interaction.member.voice === null ||
                interaction.member.voice.channel === "null" ||
                interaction.member.voice === "null"
            ) {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply(
                    "You need to be connected to the game vc (to delete the channels)!"
                );
                return;
            }
            for (var i = 0; i < scoring.length; i++) {
                if (
                    (scoring[i][0] === interaction.member.id &&
                        scoring[i][1] === interaction.channel.name) ||
                    scoring[i][2] === interaction.member.voice.channel.name
                ) {
                    break;
                } else {
                    j++;
                }
            }
            if (j < scoring.length) {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply(
                    "Your opponent has to agree to score a game!"
                );
            } else {
                if (
                    interaction.member.voice.channel === null ||
                    interaction.member.voice === null ||
                    interaction.member.voice.channel === "null" ||
                    interaction.member.voice === "null"
                ) {
                    await interaction.deferReply({ ephemeral: true });
                    await interaction.editReply(
                        "You need to be connected to the game vc (to delete the channels)!"
                    );
                    return;
                } else {
                    if (interaction.member.voice) {
                        if (interaction.member.voice.channel) {
                            if (interaction.member.voice.channel.name.includes("Game")) {
                                if (
                                    !interaction.member.voice.channel ||
                                    !interaction.member.voice.channel.name.includes("Game")
                                ) {
                                    await interaction.deferReply({ ephemeral: true });
                                    await interaction.editReply(
                                        "You need to be connected to the game VC (to delete the channels)!"
                                    );
                                } else {

                                    let channelNameE;
                                    for (var i = 0; i < scoring.length; i++) {
                                        if (scoring[i][1] === interaction.channel.name) {
                                            if (interaction.member.voice) {
                                                if (
                                                    interaction.member.voice.channel.name.includes("Game")
                                                ) {
                                                    var channelName = scoring[i][1];
                                                    var splitName = channelName.split("-");
                                                    var channelNum = splitName[1];
                                                    var channel1 = interaction.member.guild.channels.cache.find(
                                                        (c) => c.name === "Game " + channelNum + " Team 1"
                                                    );
                                                    var channel2 = interaction.member.guild.channels.cache.find(
                                                        (c) => c.name === "Game " + channelNum + " Team 2"
                                                    );
                                                    if (channel1 != undefined && channel2 != undefined) {
                                                        const channels = interaction.guild.channels.cache.filter(c => c.id === channel1.id || c.id === channel2.id);

                                                        for (const [channelID, channel] of channels) {
                                                            for (const [memberID, member] of channel.members) {
                                                                if (member.voice != undefined) {
                                                                    if (member.voice.channel != undefined) {
                                                                        member.voice.setChannel(generalMuted).then(() => console.log(`Moved ${member.user.tag}.`)).catch(console.error);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                    setTimeout(() => {
                                                        if (channel1 != undefined) {
                                                            channel1.delete().catch((err) => console.error(err));;
                                                        }
                                                        if (channel2 != undefined) {
                                                            channel2.delete().catch((err) => console.error(err));;
                                                        }
                                                    }, 1000);

                                                    channelNameE = scoring[i][1];
                                                    scoring.splice(i, 1);
                                                }
                                            }
                                        }
                                    }
                                    for (var i = 0; i < teams.length; i++) {
                                        if (teams.includes(interaction.member.id)) {
                                            teams.splice(i, 1);
                                        }
                                    }
                                    await interaction.deferReply({ ephemeral: true });

                                    for (var k = 0; k < ingame.length; k++) {
                                        if (ingame[k][1] === channelNum) {
                                            ingame.splice(k, 1);
                                        }
                                    }
                                    interaction.channel.permissionOverwrites.set([
                                        {
                                            id: interaction.channel.guild.roles.everyone,
                                            deny: [
                                                "VIEW_CHANNEL",
                                                "SEND_MESSAGES",
                                                "READ_MESSAGE_HISTORY",
                                            ],
                                        },
                                        {
                                            id: scorer,
                                            allow: [
                                                "VIEW_CHANNEL",
                                                "SEND_MESSAGES",
                                                "READ_MESSAGE_HISTORY",
                                            ],
                                        },
                                    ]);
                                    if (!interaction.channel) {
                                        console.log("Couldnt get channel");
                                    } else {
                                        if (!interaction.channel) {
                                            return;
                                        }
                                        interaction.channel.setName(
                                            interaction.channel.name + "-finished"
                                        );
                                        interaction.channel.send("<@&926688532674773032>");
                                    }
                                }
                            } else {
                                await interaction.deferReply({ ephemeral: true });
                                await interaction.editReply(
                                    "You need to be connected to the game VC."
                                );
                            }
                        }
                    }
                }
            }
        }
    }
});


let spamList = [];

// When a message is sent...
client.on("messageCreate", async (message) => {
    // Argument related.
    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice().toLowerCase();

    if (message.channel.name.includes("support") && message.author.id != "877315883859603466") {
        transcribe(message.channel.id, "<b>" + message.author.username + ":</b> " + message.content);
    }

    if (message.channel.id === registerChannel && !message.content.includes(`${prefix}`) && !message.member.roles.cache.some((r) => r.name === "Staff") && !message.member.roles.cache.some((r) => r.name === "Ranked Bridge") && message.author.id != "877315883859603466") {
        message.delete();
    }

    /*
      if (!message.member.roles.cache.some((r) => r.name === "Staff") && !message.member.roles.cache.some((r) => r.name === "Ranked Bridge") && message.author.id != "877315883859603466" && !message.member.roles.cache.some((r) => r.name === "Booster Perks") && !message.member.roles.cache.some((r) => r.name === "Booster")) {
        let id = 0;
        for (var i = 0; i < spamList.length; i++) {
          if (spamList[i][0] === message.author.id) {
            id++;
          }
        }
        spamList.push([message.author.id, message.content, id]);
    
        let spamCounter = 0;
        for (var i = 0; i < spamList.length; i++) {
          if (spamList[i][0] === message.author.id) {
            let spamMessage = spamList[i][1].toString();
            let messageContent = message.content;
            for (var k = 0; k < spamMessage.length; k++) {
              let messageThing = spamMessage.charAt(k);
              for (var j = 0; j < messageContent.length; j++) {
                let newMessageThing = messageContent.charAt(j);
                if (newMessageThing.toLowerCase() === messageThing.toLowerCase()) {
                  spamCounter++;
                }
              }
            }
          }
        }
        if (spamCounter > 10) {
          message.channel.send("Stop spamming.").then((msg) => {
            setTimeout(() => {
              if (msg != undefined && !msg.deleted) {
                msg.delete();
              }
            }, 3000)
          });
          if (message != undefined && !message.deleted) {
            message.delete();
          }
        }
        setTimeout(() => {
          spamList.splice(id, 1);
        }, 1000);
      }
    */
    if (message.content.startsWith(`${prefix}`) && !message.member.roles.cache.some((r) => r.name === "Staff") && !message.member.roles.cache.some((r) => r.name === "Booster Perks") && !message.member.roles.cache.some((r) => r.name === "Booster") && message.author.id != "877315883859603466") {
        if (message.channel.id != registerChannel && message.channel.id != queueChatChannel && message.channel.id != commandsChannel && !message.channel.name.includes("game") && !message.channel.name.includes("bullet")) {
            if (!message.content.toLowerCase().startsWith(`${prefix}register`) && !message.content.toLowerCase().startsWith(`${prefix}report`) && !message.content.toLowerCase().startsWith(`${prefix}s`)) {
                if (message != undefined) {
                    message.delete();
                }
                message.channel.send("<@" + message.author.id + ">, you can only send bot commands in <#948698934145077288> or <#948698934145077288>!").then((msg) => {
                    setTimeout(() => {
                        if (msg.deleted || !msg) {
                            return;
                        } else {
                            msg.delete();
                        }
                    }, 3000);
                });
                return;
            }
        }
    }

    if (message.content.includes("||||||||")) {
        muteUser(message, message.author, 1, "Hours", "Blacklisted spam");
        setTimeout(function () {
            message.delete();
        }, 1000);
    }

    if (message.content) {
        if (!message.member.roles.cache.some((r) => r.name === "Staff")) {
            for (var i = 0; i < blacklist.length; i++) {
                if (message.content.toLowerCase().includes(blacklist[i])) {
                    muteUser(message, message.author, 1, "Minutes", "Blacklisted word");
                    con.query(`SELECT * FROM rbridge WHERE id = '${message.author.id}'`, (err, rows) => {
                        if (rows.length < 1) {
                            message.channel.send("Weird. Couldn't get <@" + message.author.id + " in the database.");
                        } else {
                            strikeMessage(message, rows[0].name, "Blacklisted word.");
                            console.log(rows[0].name + " said a blacklisted word. Word: " + blacklist[i] + ".");
                            setTimeout(function () {
                                message.delete();
                            }, 1000);
                        }
                    });
                    break;
                }
            }
        }
    }

    if (message.content && message.author.id != "877315883859603466" && !message.content.startsWith(`${prefix}`)) {
        con.query(`SELECT * FROM leveling WHERE id='${message.author.id}'`, (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                console.log("User isn't in the leveling database. Inserting them...");
                sql = `INSERT INTO leveling(id, exp, level) VALUES('${message.author.id}', 0, 0)`;
                con.query(sql);
                logFile("Inserted " + message.author.id + " into the leveling table.");
                return;
            } else {
                let experience = rows[0].exp;
                let level = rows[0].level;
                let expP = experience += (Math.pow(message.content.length / 1.01, 3 / 2.3));
                if (expP > 1000 && level === 0) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `1`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=1 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 4000 && level === 1) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `2`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=2 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 16000 && level === 2) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `3`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=3 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 32000 && level === 3) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `4`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=4 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 64000 && level === 4) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `5`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=5 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 128000 && level === 5) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `6`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=6 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 256000 && level === 6) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `7`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=7 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 512000 && level === 7) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `8`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=8 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 1024000 && level === 8) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `9`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=9 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 2048000 && level === 9) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `10`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=10 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 4096000 && level === 10) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `11`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=11 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 8192000 && level === 11) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `12`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=12 WHERE id='${message.author.id}'`;
                    con.query(sql);
                } else if (expP > 16384000 && level === 12) {
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + message.author.tag + "` leveled up!")
                        .setDescription("New Level: `13`")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed] });
                    sql = `UPDATE leveling SET level=13 WHERE id='${message.author.id}'`;
                    con.query(sql);
                }
                sql = `UPDATE leveling SET exp=${expP} WHERE id='${message.author.id}'`;
                con.query(sql);
                logFile("Updated " + message.author.id + "'s experience to " + expP);
            }
        });
        // Don't ping checker
        let mention = message.mentions.members.first();
        if (mention != undefined) {
            if (mention.roles.cache.some((r) => r.name === "DON'T PING") && !message.member.roles.cache.some((r) => r.name === "Staff")) {
                let otherMember;
                let isInParty = false;
                for (var i = 0; i < parties.length; i++) {
                    if (parties[i][2].includes(message.author.id)) {
                        isInParty = true;
                        let partyID = parties[i][0];
                        let splitParty = partyID.split(" ");
                        console.log("Party ID: " + partyID);
                        console.log("splitParty: " + splitParty);
                        if (splitParty[0] === message.author.id) {
                            otherMember = splitParty[1];
                        } else {
                            otherMember = splitParty[0];
                        }
                        console.log("Other Member: " + otherMember);
                    }
                }
                if (!isInParty) {
                    warnUser(message, message.author, message.author.id, "Pinging a don't ping user.");
                } else {
                    if (mention.id != otherMember) {
                        warnUser(message, message.author, message.author.id, "Pinging a don't ping user.");
                    }
                }
            }
        }
    }

    if (!message.content) {
        logFile(message.author.tag + " sent an empty message/embed.");
    } else {
        logFile(message.author.tag + " sent the message: " + message.content);
    }

    if (message.channel.id === screenshareChannel) {
        setTimeout(function () {
            if (message.deleted || !message) {
                return;
            } else {
                message.delete();
            }
        }, 60000);
    }

    if (message.content.toLowerCase() === "ratio" || message.content.toLowerCase().includes("+ ratio") || message.content.toLowerCase().includes("counter ratio")) {
        message.react("👍");
        message.react("👎");
    }

    if (cmd === `${prefix}banmap` || cmd === `${prefix}veto`) {
        /*
        Sunstone
        Fortress v2
        Tundra
        Mr. Cheesy
        Tundra v2
        Lighthouse v2
        Outpost
        Palaestra
        Atlantis
        Flora
        Condo
        Licorice
        Dojo
        Aquatica
        Ashgate
        Chronon
        Sorcery
        Boo
        Hyperfrost
        Treehouse
        Galaxy
        Stumped
        Urban
        */
        if (args.length < 2) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Invalid arguments!")
                .setDescription("Correct usage: `=banmap <map_name>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        } else {
            let input = args[1].toLowerCase();
            const sunstone = new MessageAttachment("../container/images/maps/sunstone.png");
            const fortress = new MessageAttachment("../container/images/maps/fortress.png");
            const tundra = new MessageAttachment("../container/images/maps/tundra.png");
            const cheesy = new MessageAttachment("../container/images/maps/mister_cheesy.png");
            const lighthouse = new MessageAttachment("../container/images/maps/lighthouse.png");
            const palaestra = new MessageAttachment("../container/images/maps/palaestra.png");
            const atlantis = new MessageAttachment("../container/images/maps/atlantis.png");
            const flora = new MessageAttachment("../container/images/maps/flora.png");
            const condo = new MessageAttachment("../container/images/maps/condo.png");
            const licorice = new MessageAttachment("../container/images/maps/licorice.png");
            const dojo = new MessageAttachment("../container/images/maps/dojo.png");
            const aquatica = new MessageAttachment("../container/images/maps/aquatica.png");
            const ashgate = new MessageAttachment("../container/images/maps/ashgate.png");
            const chronon = new MessageAttachment("../container/images/maps/chronon.png");
            const sorcery = new MessageAttachment("../container/images/maps/sorcery.png");
            const boo = new MessageAttachment("../container/images/maps/boo.png");
            const hyperfrost = new MessageAttachment("../container/images/maps/hyperfrost.png");
            const treehouse = new MessageAttachment("../container/images/maps/treehouse.png");
            const galaxy = new MessageAttachment("../container/images/maps/galaxy.png");
            const stumped = new MessageAttachment("../container/images/maps/stumped.png");
            const urban = new MessageAttachment("../container/images/maps/urban.png");

            if (input === "sunstone" || input.startsWith("su")) {
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Sunstone")
                    .setImage("attachment://sunstone.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [sunstone] });
                // Ban Sunstone
            } else if (input === "fortress" || input === "fortress v2" || input.startsWith("fo")) {
                // Ban Fortress v2
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Fortress v2")
                    .setImage("attachment://fortress.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [fortress] });
            } else if (input === "tundra" || input === "tundra v2" || input.startsWith("tu")) {
                // Ban Tundra v2
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Tundra v2")
                    .setImage("attachment://tundra.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [tundra] });
            } else if (input === "cheesy" || input === "mr. cheesy" || input === "mister cheesy" || input === "mister" || input.startsWith("m")) {
                // Ban Mister Cheesy
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Mister Cheesy")
                    .setImage("attachment://mister_cheesy.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [cheesy] });
            } else if (input === "lighthouse" || input === "lighthouse v2" || input === "light" || input.startsWith("lig")) {
                // Ban Lighthouse v2
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Lighthouse v2")
                    .setImage("attachment://lighthouse.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [lighthouse] });
            } else if (input === "aquatica" || input === "aqua" || input.startsWith("aq")) {
                // Ban Lighthouse v2
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Aquatica")
                    .setImage("attachment://aquatica.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [aquatica] });
            } else if (input === "outpost" || input === "out" || input.startsWith("o")) {
                // Ban Outpost
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Outpost")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed] });
            } else if (input === "palaestra" || input.startsWith("p")) {
                // Ban Palaestra
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Palaestra")
                    .setImage("attachment://palaestra.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [palaestra] });
            } else if (input === "atlantis" || input.startsWith("at")) {
                // Ban Atlantis
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Atlantis")
                    .setImage("attachment://atlantis.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [atlantis] });
            } else if (input === "flora" || input.startsWith("fl")) {
                // Ban Flora
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Flora")
                    .setImage("attachment://flora.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [flora] });
            } else if (input === "condo" || input.startsWith("co")) {
                // Ban Condo
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Condo")
                    .setImage("attachment://condo.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [condo] });
            } else if (input === "licorice" || input.startsWith("lic")) {
                // Ban Licorice
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Licorice")
                    .setImage("attachment://licorice.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [licorice] });
            } else if (input === "dojo" || input.startsWith("d")) {
                // Ban Dojo
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Dojo")
                    .setImage("attachment://dojo.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [dojo] });
            } else if (input === "ashgate" || input.startsWith("as")) {
                // Ban Ashgate
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Ashgate")
                    .setImage("attachment://ashgate.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [ashgate] });
            } else if (input === "chronon" || input.startsWith("ch")) {
                // Ban Chronon
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Chronon")
                    .setImage("attachment://chronon.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [chronon] });
            } else if (input === "sorcery" || input.startsWith("so")) {
                // Ban Sorcery
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Sorcery")
                    .setImage("attachment://sorcery.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [sorcery] });
            } else if (input === "boo" || input.startsWith("b")) {
                // Ban Boo
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Boo")
                    .setImage("attachment://boo.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [boo] });
            } else if (input === "hyperfrost" || input === "hyper" || input.startsWith("h")) {
                // Ban Hyperfrost
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Hyperfrost")
                    .setImage("attachment://hyperfrost.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [hyperfrost] });
            } else if (input === "treehouse" || input === "tree" || input.startsWith("t")) {
                // Ban Treehouse
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Treehouse")
                    .setImage("attachment://treehouse.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [treehouse] });
            } else if (input === "galaxy" || input.startsWith("g")) {
                // Ban Galaxy
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Galaxy")
                    .setImage("attachment://galaxy.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [galaxy] });
            } else if (input === "stumped" || input.startsWith("st")) {
                // Ban Stumped
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Stumped")
                    .setImage("attachment://stumped.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [stumped] });
            } else if (input === "urban" || input.startsWith("u")) {
                // Ban Urban
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(message.author.tag + "'s Team has Banned Urban")
                    .setImage("attachment://urban.png")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [urban] });
            } else {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Please provide a valid map!")
                    .setDescription("List of maps:\n```Urban\nFortress v2\nTundra v2\nOutpost\nPalaestra\nAtlantis\nMister Cheesy\nLighthouse v2\nFlora\nCondo\nLicorice\nDojo\nAquatica\nAshgate\nChronon\nSorcery\nBoo\nHyperfrost\nTreehouse\nGalaxy\nStumped```")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            }
        }
    }

    if (cmd.toLowerCase() === `${prefix}unmute`) {
        if (message.member.roles.cache.some((r) => r.name === "Booster Perks") || message.member.roles.cache.some((r) => r.name === "Booster")) {
            let mention = message.mentions.members.first();
            if (!mention) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You need to be mention an user!")
                    .setDescription("Correct usage: `=unmute @user`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            } else {
                if (!message.member.voice || !message.member.voice.channel) {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("You need to be connected to a voice channel!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed], files: [file] });
                    return;
                }
                if (message.member.voice.channel.name.includes("Game")) {
                    if (mention.voice != undefined) {
                        if (mention.voice.channel != null || mention.voice.channel != undefined) {
                            if (mention.voice.channel.id === message.member.voice.channel.id) {
                                mention.voice.setMute(false);
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Done.")
                                    .setDescription("Unmuted <@" + mention.id + ">.")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed] });
                            } else {
                                const file = new MessageAttachment("../container/caution_gif.gif");
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("That user isn't in your VC!")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed], files: [file] });
                            }
                        } else {
                            const file = new MessageAttachment("../container/caution_gif.gif");
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("That user isn't connected to a VC!")
                                .setDescription("If this is an error, ping Eltik.")
                                .setThumbnail("attachment://caution_gif.gif")
                                .setTimestamp();
                            // Send the embd.
                            message.reply({ embeds: [notSetEmbed], files: [file] });
                        }
                    } else {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user isn't connected to a VC!")
                            .setDescription("If this is an error, ping Eltik.")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed], files: [file] });
                    }
                } else {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("You're not in a Game VC!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed], files: [file] });
                }
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission!")
                .setDescription("You need to be a Booster to use this command.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}sload`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=sload @user`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            }
            let mention = message.mentions.members.first();
            if (!mention) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Please provide an user!")
                    .setDescription("Correct usage: `=sload @user`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            }

            let hasApplication = false;
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Loading...")
                .setDescription("Attempting to rechieve data from Google API... This may take a few seconds.")
                .setTimestamp();
            message.reply({ embeds: [notSetEmbed] }).then((msg) => {
                spreadsheet.load().then((response) => {
                    for (var i = 0; i < response.length; i++) {
                        var isScorer = false;

                        var tag = response[i]['What is your Discord tag? (Ex. Eltik#5776)'];
                        var id = response[i]['What is your Discord ID?'];
                        if (mention.user.tag === tag || mention.id === id) {
                            hasApplication = true;
                            var fourteen = response[i]['Are you 14 or older?'];
                            var mic = response[i]['Do you have a mic?'];
                            var position = response[i]['What position are you applying for?'];
                            var timezone = response[i]['What is your timezone?'];
                            var qpreviousExp = response[i]['Do you have previous scorer experience'];
                            var previousExp = response[i]['If you have had previous experience scoring, what was it?'];
                            var abilityTech = response[i]['How would you describe your ability to use technology and Discord commands?'];
                            var understandScoring = response[i]['Do you understand that, if you are accepted, you will be punished for incorrect scoring?'];
                            var understandMaturity = response[i]['Do you understand that, if you are accepted, there is a level of maturity expected of you as you are affiliated with Ranked Bridge?'];
                            var currentlyStaff = response[i]['Are you currently in a staff position in another server and/or have you previously been in a staff position in another server?'];
                            var describeAbility = response[i]['How would you describe your ability to be mature when necessary?'];
                            var understandYes = response[i]['Do you understand that, if you are accepted, a high level of maturity will be expected of you as you will directly represent Ranked Bridge, Eltik, and the staff?'];

                            if (position === "Scorer") {
                                isScorer = true;
                            }

                            if (!isScorer) {
                                let description = "";
                                let counter = 0;
                                while (description.length < 4096 && counter < 7) {
                                    if (counter === 0) {
                                        description = "**What is your Discord tag?** `" + tag + "`\n";
                                        counter++;
                                    } else if (counter === 1) {
                                        if (!id) {
                                            description = description + "**What is your Discord ID?** `Not provided.`\n";
                                        } else {
                                            description = description + "**What is your Discord ID?** `" + id + "`\n";
                                        }
                                        counter++;
                                    } else if (counter === 2) {
                                        description = description + "**Are you fourteen or older?** `" + fourteen + "`\n";
                                        counter++;
                                    } else if (counter === 3) {
                                        description = description + "**Do you have a mic?** `" + mic + "`\n";
                                        counter++;
                                    } else if (counter === 4) {
                                        description = description + "**Are you currently in a staff position in another server and/or have you previously been in a staff position in another server?** ```" + currentlyStaff + "```\n";
                                        counter++;
                                    } else if (counter === 5) {
                                        description = description + "**How would you describe your ability to be mature when necessary?** ```" + describeAbility + "```\n";
                                        counter++;
                                    } else if (counter === 6) {
                                        description = description + "**Do you understand that, if you are accepted, a high level of maturity will be expected of you as you will directly represent Ranked Bridge, Eltik, and the staff?** ```" + describeAbility + "```";
                                        counter++;
                                    }
                                }
                                const sendEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle(`Moderator Application`)
                                    .setDescription(description)
                                    .setTimestamp();
                                msg.edit({ embeds: [sendEmbed] }).catch((err) => console.error(err));
                            } else {
                                let description = "";
                                let counter = 0;
                                while (description.length < 4096 && counter < 10) {
                                    if (counter === 0) {
                                        description = "**What is your Discord tag?** `" + tag + "`\n";
                                        counter++;
                                    } else if (counter === 1) {
                                        if (!id) {
                                            description = description + "**What is your Discord ID?** `Not provided.`\n";
                                        } else {
                                            description = description + "**What is your Discord ID?** `" + id + "`\n";
                                        }
                                        counter++;
                                    } else if (counter === 2) {
                                        description = description + "**Are you fourteen or older?** `" + fourteen + "`\n";
                                        counter++;
                                    } else if (counter === 3) {
                                        description = description + "**Do you have a mic?** `" + mic + "`\n";
                                        counter++;
                                    } else if (counter === 4) {
                                        description = description + "**What is your timezone?** `" + timezone + "`\n";
                                        counter++;
                                    } else if (counter === 5) {
                                        description = description + "**Do you have previous scorer experience?** ```" + qpreviousExp + "```\n";
                                        counter++;
                                    } else if (counter === 6) {
                                        if (!previousExp) {
                                            description = description + "**If you have had previous experience scoring, what was it?** ```Not provided.```\n";
                                        } else {
                                            description = description + "**If you have had previous experience scoring, what was it?** ```" + previousExp + "```\n";
                                        }
                                        counter++;
                                    } else if (counter === 7) {
                                        description = description + "**How would you describe your ability to use technology and Discord commands?** ```" + abilityTech + "```\n";
                                        counter++;
                                    } else if (counter === 8) {
                                        description = description + "**Do you understand that, if you are accepted, you will be punished for incorrect scoring?** ```" + understandScoring + "```\n";
                                        counter++;
                                    } else if (counter === 9) {
                                        description = description + "**Do you understand that, if you are accepted, there is a level of maturity expected of you as you are affiliated with Ranked Bridge?** ```" + understandMaturity + "```\n";
                                        counter++;
                                    }
                                }
                                const sendEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle(`Scorer Application`)
                                    .setDescription(description)
                                    .setTimestamp();
                                msg.edit({ embeds: [sendEmbed] }).catch((err) => console.error(err));
                            }
                        }
                    }
                });
                if (!hasApplication) {
                    const sendEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("That user has no applications.")
                        .setDescription("If this is an error, ping Eltik.")
                        .setTimestamp();
                    msg.edit({ embeds: [sendEmbed] }).catch((err) => console.error(err));
                }
            }).catch((err) => console.error(err));
        } else {
            message.reply("u suck");
        }
    }

    if (cmd.toLowerCase() === `${prefix}finish`) {
        if (message.member.roles.cache.some((r) => r.name === "Scorer")) {
            if (!message.channel.name.includes("game")) {
                message.reply("You can only send this in game channels!");
                return;
            }
            for (var i = 0; i < scoring.length; i++) {
                if (scoring[i][1] === message.channel.name) {
                    var channelName = scoring[i][1];
                    var splitName = channelName.split("-");
                    var channelNum = splitName[1];
                    var channel1 = message.member.guild.channels.cache.find(
                        (c) => c.name === "Game " + channelNum + " Team 1"
                    );
                    var channel2 = message.member.guild.channels.cache.find(
                        (c) => c.name === "Game " + channelNum + " Team 2"
                    );
                    scoring.splice(i, 1);
                    if (!channel1) {
                        console.log("Couldn't get team 1 vc");
                    } else {
                        channel1.delete().catch((err) => console.error(err));
                    }
                    if (!channel2) {
                        console.log("Couldn't get team 2 vc");
                    } else {
                        channel2.delete().catch((err) => console.error(err));
                    }
                }
            }
            var channelName = message.channel.name;
            var splitName = channelName.split("-");
            var channelNum = splitName[1];
            var channel1 = message.member.guild.channels.cache.find(
                (c) => c.name === "Game " + channelNum
            );
            if (!channel1) {
                message.reply("The game VC doesn't exist. Proceeding as normal...");
            } else {
                channel1.delete().catch((err) => console.error(err));
            }
            message.channel.permissionOverwrites.set([
                {
                    id: message.channel.guild.roles.everyone,
                    deny: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "READ_MESSAGE_HISTORY",
                    ],
                },
                {
                    id: scorer,
                    allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "READ_MESSAGE_HISTORY",
                    ],
                },
            ]);
            if (!message.channel) {
                return;
            }
            message.channel.setName(message.channel.name + "-finished").catch((err) => console.error(err));
            message.channel.send("<@&926688532674773032>");
        } else {
            message.reply("sup :o");
        }
    }

    if (cmd.toLowerCase() === `${prefix}add`) {
        if (args.length < 2) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Invalid arguments!")
                .setDescription("Correct usage: `=add <role | user> <id | @Role>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            return;
        }
        if (args[1].toLowerCase() === "role") {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Error!")
                .setDescription("Couldn't get that role. Correct usage: `=add <role | user> <id | @Role>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();

            let mentionedRole = message.mentions.roles.first();
            let roleID;
            if (!mentionedRole) {
                let roleFetched = message.guild.roles.cache.find(r => r.id === args[2]);
                if (!roleFetched) {
                    message.reply({ embeds: [errorEmbed] });
                    return;
                } else {
                    roleID = args[2];
                }
            } else {
                roleID = mentionedRole.id;
            }
            message.channel.permissionOverwrites.edit(roleID, { VIEW_CHANNEL: true }).catch((err) => console.error(err));;
            message.channel.permissionOverwrites.edit(roleID, { SEND_MESSAGES: true }).catch((err) => console.error(err));;
            message.channel.permissionOverwrites.edit(roleID, { READ_MESSAGE_HISTORY: true }).catch((err) => console.error(err));;
            const successEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Done!")
                .setDescription("Added role <@" + roleID + "> to <#" + message.channel.id + ">.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
        } else if (args[1].toLowerCase() === "user") {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Error!")
                .setDescription("Couldn't get that role. Correct usage: `=add <role | user> <id | @Role>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();

            let mentionedUser = message.mentions.members.first();
            if (!mentionedUser) {
                let userFetch = await message.guild.members.fetch(args[2]).then(async (user) => {
                    message.channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: true }).catch((err) => console.error(err));;
                    message.channel.permissionOverwrites.edit(user.id, { SEND_MESSAGES: true }).catch((err) => console.error(err));;
                    message.channel.permissionOverwrites.edit(user.id, { READ_MESSAGE_HISTORY: true }).catch((err) => console.error(err));;
                    const successEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Done!")
                        .setDescription("Added role <@" + user.id + "> to <#" + message.channel.id + ">.")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                }).catch((err) => {
                    message.reply({ embeds: [errorEmbed] });
                });
            } else {
                message.channel.permissionOverwrites.edit(mentionedUser.id, { VIEW_CHANNEL: true }).catch((err) => console.error(err));;
                message.channel.permissionOverwrites.edit(mentionedUser.id, { SEND_MESSAGES: true }).catch((err) => console.error(err));;
                message.channel.permissionOverwrites.edit(mentionedUser.id, { READ_MESSAGE_HISTORY: true }).catch((err) => console.error(err));;
                const successEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Done!")
                    .setDescription("Added role <@" + mentionedUser.id + "> to <#" + message.channel.id + ">.")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Unknown argument!")
                .setDescription("Correct usage: `=add <role | user> <id | @Role>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            message.reply({ embeds: [errorEmbed] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}test`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            const supportEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Ranked Bridge Tickets")
                .setDescription("If you don't state your issue within **five minutes** of a ticket being opened, it will be closed.```diff\n-Support-\n```\nIf you need any help, want to apply for Staff/Scorer, confused on how the bot works, etc. Open a support ticket by clicking the **📩Support** button below.```diff\n-Report-\n```\nIf you wish to report someone for ghost block abusing, breaking server rules, etc. Click the **💔Report** button beloow.")
                .setTimestamp();
            const supportRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("support")
                    .setLabel("📩Support")
                    .setStyle("PRIMARY")
            );
            const reportRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("report")
                    .setLabel("💔Report")
                    .setStyle("PRIMARY")
            );

            message.channel.send({ embeds: [supportEmbed], components: [supportRow, reportRow] });
        } else {
            message.channel.send("gg");
        }
    }

    if (cmd.toLowerCase() === `${prefix}updateperms`) {
        if (!message.member.roles.cache.some((r) => r.name === "Staff")) {
            return;
        }
        const fullPermissions = [
            {
                id: '942893451551309907', // delete
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '943204857995726948', // score
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: scorer, // scorer
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451597471828', // warn
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309913', // mute
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309914', // unmute
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451597471826', // freeze
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: screensharer, // screensharer
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451597471827', // unfreeze
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: screensharer, // screensharer
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309909', // kick
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309911', // ban
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: moderator, // moderator
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451597471824', // unban
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: moderator, // moderator
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451597471825', // forceban
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: moderator, // moderator
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309908', // strike
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942886551048843356', // forceclose
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942886551048843355', // close
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309906', // saturday
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
            {
                id: '942893451551309910', // info
                permissions: [{
                    id: message.guild.roles.everyone.id,
                    type: 'ROLE',
                    permission: false,
                    id: staff, // staff
                    type: 'ROLE',
                    permission: true,
                }],
            },
        ];

        await client.guilds.cache.get(guildId)?.commands.permissions.set({ fullPermissions });
        await message.reply("Done");
    }

    if (cmd.toLowerCase() === `${prefix}games` || cmd.toLowerCase() === `${prefix}game`) {
        if (args.length < 2) {
            message.reply('ayo u need to provide arguments. ex. `=games get <num>`');
            return;
        }
        if (args[1].toLowerCase() === "get") {
            if (isNaN(args[2])) {
                message.reply("provided an integer thx");
                return;
            }
            con.query(`SELECT * FROM games WHERE gameid=${args[2]}`, (err, rows) => {
                if (err) return message.reply("yo there was an error try again");
                if (rows.length < 1) {
                    message.reply("That game doesn't exist!");
                    return;
                }
                let winnerID = rows[0].winnerid;
                let winnerTID = rows[0].winnerteammate;
                let loserID = rows[0].loserid;
                let loserTID = rows[0].loserteammate;
                let winnerELO = rows[0].winnerelo;
                let winnerTELO = rows[0].winnerteammateelo;
                let loserELO = rows[0].loserelo;
                let loserTELO = rows[0].loserteammateelo;

                let isVoided = false;
                if (winnerELO === 0) {
                    isVoided = true;
                }

                let isSolos = false;
                if (!winnerTID) {
                    isSolos = true;
                }

                if (!isVoided) {
                    if (!isSolos) {
                        const embedThing = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Game #" + rows[0].gameid)
                            .setDescription("**Winner:** <@" + winnerID + "> `(" + winnerELO + ")`\n**Winner Teammate:** <@" + winnerTID + "> `(" + winnerTELO + ")`\n**Losers:** <@" + loserID + "> `(" + loserELO + ")`\n**Loser Teammate:** <@" + loserTID + "> `(" + loserTELO + ")`")
                            .setTimestamp();
                        message.channel.send({ embeds: [embedThing] });
                    } else {
                        const embedThing = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Game #" + rows[0].gameid)
                            .setDescription("**Winner:** <@" + winnerID + "> `(" + winnerELO + ")`\n**Losers:** <@" + loserID + "> `(" + loserELO + ")`")
                            .setTimestamp();
                        message.channel.send({ embeds: [embedThing] });
                    }
                } else {
                    if (!isSolos) {
                        const embedThing = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Game #" + rows[0].gameid)
                            .setDescription("**Winner:** <@" + winnerID + ">\n**Winner Teammate:** <@" + winnerTID + ">\n**Loser:** <@" + loserID + ">\n**Loser Teammate:** <@" + loserTID + ">\n`GAME VOIDED`")
                            .setTimestamp();
                        message.channel.send({ embeds: [embedThing] });
                    } else {
                        const embedThing = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Game #" + rows[0].gameid)
                            .setDescription("**Winner:** <@" + winnerID + ">\n**Loser:** <@" + loserID + ">\n`GAME VOIDED`")
                            .setTimestamp();
                        message.channel.send({ embeds: [embedThing] });
                    }
                }
            });
        }
    }

    if (cmd.toLowerCase() === `${prefix}loop`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            const connection = joinVoiceChannel(
                {
                    channelId: mainChannel,
                    guildId: guildId,
                    adapterCreator: message.guild.voiceAdapterCreator
                });
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Done.")
                .setDescription("Looping through the ban table and repeating <#" + queueChannel + "> thing...")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed] });
            setInterval(function () {
                runBanLoop(message);
                runMuteLoop(message);
            }, 5000);
            setInterval(function () {
                const connection = joinVoiceChannel(
                    {
                        channelId: queueChannel,
                        guildId: guildId,
                        adapterCreator: message.guild.voiceAdapterCreator
                    });
            }, 10000);
        } else {
            message.reply("sup :o");
        }
    }

    if (cmd.toLowerCase() === `${prefix}dm`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 3) {
                message.reply("smh not enough args.");
                return;
            }
            let mention = message.mentions.members.first();
            if (!mention) {
                message.reply("couldnt get that user smh");
                return;
            }
            let toDM = "";
            for (var i = 2; i < args.length; i++) {
                toDM = toDM + " " + args[i];
            }
            message.react("👍");
            mention.send(toDM).then(m => {
                m.react("👍");
                m.react("👎");
            }).catch(() => message.reply("Can't send DM to your user!"));
        } else {
            message.reply("sup :o (no perms L)").then(m => {
                m.react("👍");
                m.react("👎");
            });
        }
    }

    if (cmd.toLowerCase() === `${prefix}clear`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (!isNaN(message.content.split(' ')[1])) {
                let amount = 1;
                if (message.content.split(' ')[1] === '1' || message.content.split(' ')[1] === '0') {
                    amount = 1;
                } else {
                    amount = message.content.split(' ')[1];
                    if (amount > 100) {
                        amount = 100;
                    }
                }
                await message.channel.bulkDelete(amount, true).then((_message) => {
                    message.channel.send(`Bot cleared \`${_message.size}\` messages :broom:`).then((sent) => {
                        setTimeout(function () {
                            sent.delete();
                        }, 2500);
                    });
                });
            } else {
                message.channel.send('enter the amount of messages that you would like to clear').then((sent) => {
                    setTimeout(function () {
                        sent.delete();
                    }, 2500);
                });
            }
        }
    }

    if (cmd.toLowerCase() === `${prefix}giveaway`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 2) {
                message.reply("Please mention the amount of winners.");
                return;
            }
            let winners = args[1];
            if (winners > 1) {
                message.reply("Currently only 1 winner works.");
                return;
            }
            const filter = response => {
                return message.content;
            };
            message.channel.send("What's the giveaway for?", { fetchReply: true }).then(() => {
                message.channel.awaitMessages({ filter, max: 1, errors: ["time"] }).then((collected) => {
                    message.channel.send(
                        "Okay! The giveaway will be `" +
                        collected.first().content +
                        "`."
                    );
                    const giveawayFor = collected.first().content;
                    message.channel.send("What's the time for the giveaway?", { fetchReply: true }).then(() => {
                        message.channel.awaitMessages({ filter, max: 1, errors: ["time"] }).then((collected) => {
                            const time = collected.first().content.toString();
                            let timeLength = time.length;
                            let timeFormat = time.charAt(timeLength - 1);
                            let numTime;
                            for (var k = 0; k < timeLength - 1; k++) {
                                if (k != 0) {
                                    numTime = numTime + time.charAt(k);
                                } else {
                                    numTime = time.charAt(k);
                                }
                            }
                            if (numTime > 24 && timeFormat === "d") {
                                const file = new MessageAttachment("../container/caution_gif.gif");
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle(
                                        "Due to JavaScript's current limitations, you can't start a giveaway for more than 24 days."
                                    )
                                    .setDescription("This will hopefully be fixed soon.")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed], files: [file] });
                                return;
                            } else {
                                if (timeFormat != undefined && typeof timeFormat != "undefined") {
                                    if (timeFormat === "d") {
                                        message.channel.send(
                                            "Okay! The time of the giveaway will be `" +
                                            collected.first().content +
                                            "`."
                                        );
                                        const suggestEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Giveaway")
                                            .setDescription("Giving Away: `" + giveawayFor + "`")
                                            .setFooter("From " + message.author.tag)
                                            .setTimestamp();
                                        const a = Math.floor(Math.random() * (1000 - 1)) + 1;
                                        const row = new MessageActionRow().addComponents(
                                            new MessageButton()
                                                .setCustomId("giveaway-" + a)
                                                .setLabel("Enter the Giveaway")
                                                .setStyle("SUCCESS")
                                        );
                                        message.channel.send({ embeds: [suggestEmbed], components: [row] }).then((msg) => {
                                            startGiveaway(message, numTime, a, winners, 86400000, msg);
                                        });
                                        // numTime * 86400000
                                    } else if (timeFormat === "m") {
                                        message.channel.send(
                                            "Okay! The time of the giveaway will be `" +
                                            collected.first().content +
                                            "`."
                                        );
                                        const suggestEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Giveaway")
                                            .setDescription("Giving Away: `" + giveawayFor + "`")
                                            .setFooter("From " + message.author.tag)
                                            .setTimestamp();
                                        const a = Math.floor(Math.random() * (1000 - 1)) + 1;
                                        const row = new MessageActionRow().addComponents(
                                            new MessageButton()
                                                .setCustomId("giveaway-" + a)
                                                .setLabel("Enter the Giveaway")
                                                .setStyle("SUCCESS")
                                        );
                                        message.channel.send({ embeds: [suggestEmbed], components: [row] }).then((msg) => {
                                            startGiveaway(message, numTime, a, winners, 60000, msg);
                                        });
                                        // numTime * 60000
                                    } else if (timeFormat === "s") {
                                        message.channel.send(
                                            "Okay! The time of the giveaway will be `" +
                                            collected.first().content +
                                            "`."
                                        );
                                        const suggestEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Giveaway")
                                            .setDescription("Giving Away: `" + giveawayFor + "`")
                                            .setFooter("From " + message.author.tag)
                                            .setTimestamp();
                                        const a = Math.floor(Math.random() * (1000 - 1)) + 1;
                                        const row = new MessageActionRow().addComponents(
                                            new MessageButton()
                                                .setCustomId("giveaway-" + a)
                                                .setLabel("Enter the Giveaway")
                                                .setStyle("SUCCESS")
                                        );
                                        message.channel.send({ embeds: [suggestEmbed], components: [row] }).then((msg) => {
                                            startGiveaway(message, numTime, a, winners, 1000, msg);
                                        });
                                        // numTime * 1000
                                    } else if (timeFormat === "h") {
                                        message.channel.send(
                                            "Okay! The time of the giveaway will be `" +
                                            collected.first().content +
                                            "`."
                                        );
                                        const suggestEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Giveaway")
                                            .setDescription("Giving Away: `" + giveawayFor + "`")
                                            .setFooter("From " + message.author.tag)
                                            .setTimestamp();
                                        const a = Math.floor(Math.random() * (1000 - 1)) + 1;
                                        const row = new MessageActionRow().addComponents(
                                            new MessageButton()
                                                .setCustomId("giveaway-" + a)
                                                .setLabel("Enter the Giveaway")
                                                .setStyle("SUCCESS")
                                        );
                                        message.channel.send({ embeds: [suggestEmbed], components: [row] }).then((msg) => {
                                            startGiveaway(message, numTime, a, winners, 3600000, msg);
                                        });
                                        // numTime * 3600000
                                    } else {
                                        const file = new MessageAttachment(
                                            "../container/caution_gif.gif"
                                        );
                                        const notSetEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Please provide a valid time!")
                                            .setDescription(
                                                "Ex. `1d` for 1 day, `1m` for 1 minute, `1s` for 1 second, and `1h` for 1 hour."
                                            )
                                            .setThumbnail("attachment://caution_gif.gif")
                                            .setTimestamp();
                                        // Send the embd.
                                        message.reply({ embeds: [notSetEmbed], files: [file] });
                                    }
                                } else {
                                    const file = new MessageAttachment("../container/caution_gif.gif");
                                    const notSetEmbed = new Discord.MessageEmbed()
                                        .setColor("#2f3136")
                                        .setTitle("Please provide a valid time!")
                                        .setDescription(
                                            "Ex. `1d` for 1 day, `1m` for 1 minute, `1s` for 1 second, and `1h` for 1 hour."
                                        )
                                        .setThumbnail("attachment://caution_gif.gif")
                                        .setTimestamp();
                                    // Send the embd.
                                    message.reply({ embeds: [notSetEmbed], files: [file] });
                                }
                            }
                        })
                    });
                })
            });
        }
    }

    if (cmd.toLowerCase() === `${prefix}fix`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=fix <user>`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                message.reply({ embeds: [notSetEmbed] });
                return;
            }
            let mention = message.mentions.members.first();
            let name;
            if (!mention) {
                con.query(`SELECT * FROM rbridge WHERE name='${args[1]}'`, (err, rows) => {
                    if (rows.length < 1) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user doesn't exist!")
                            .setDescription("Correct usage: `=fix <user>`")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        message.reply({ embeds: [notSetEmbed] });
                        return;
                    } else {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const errorEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user doesn't exist!")
                            .setDescription("Correct usage: `=fix <user>`")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        name = rows[0].name;
                        elo = rows[0].elo;
                        var asdf = message.guild.members.fetch(rows[0].id).then((user) => {
                            if (!user) {
                                const file = new MessageAttachment("../container/caution_gif.gif");
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("That user doesn't exist!")
                                    .setDescription("Correct usage: `=fix <user>`")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                message.reply({ embeds: [notSetEmbed] });
                                return;
                            }
                            user.setNickname("[" + elo + "] " + name);
                            scoreElo(message, rows[0].id, elo);
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("Done!")
                                .setDescription("Successfully fixed <@" + rows[0].id + ">.")
                                .setTimestamp();
                            message.reply({ embeds: [notSetEmbed] });
                        }).catch((err) => message.reply({ embeds: [errorEmbed] }));
                    }
                })
            } else if (mention) {
                con.query(`SELECT * FROM rbridge WHERE id='${mention.id}'`, (err, rows) => {
                    if (rows.length < 1) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user doesn't exist!")
                            .setDescription("Correct usage: `=fix <user>`")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        return message.reply({ embeds: [notSetEmbed] });
                    } else {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const errorEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user doesn't exist!")
                            .setDescription("Correct usage: `=fix <user>`")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        name = rows[0].name;
                        elo = rows[0].elo;
                        var asdf = message.guild.members.fetch(mention.id).then((user) => {
                            if (!user) {
                                const file = new MessageAttachment("../container/caution_gif.gif");
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("That user doesn't exist!")
                                    .setDescription("Correct usage: `=fix <user>`")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                return message.reply({ embeds: [notSetEmbed] });
                            }
                            user.setNickname("[" + elo + "] " + name);
                            scoreElo(message, mention.id, elo);
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("Done!")
                                .setDescription("Successfully fixed <@" + rows[0].id + ">.")
                                .setTimestamp();
                            message.reply({ embeds: [notSetEmbed] });
                        }).catch((err) => message.reply({ embeds: [errorEmbed] }));
                    }
                })
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setDescription("You need to be Staff.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            return message.reply({ embeds: [notSetEmbed] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}infractions`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            let mention = message.mentions.members.first();
            let name;
            if (!mention) {
                con.query(`SELECT * FROM rbridge WHERE name='${args[2]}'`, (err, rows) => {
                    if (rows.length < 1) {
                        message.reply("Couldn't get that user!");
                        return;
                    } else {
                        name = rows[0].name;
                        con.query(`SELECT * FROM punishments WHERE name='${name}'`, (erre, rowess) => {
                            if (erre) throw erre;
                            con.query(`SELECT * FROM warns WHERE id='${rows[0].id}'`, (erres, rowees) => {
                                if (erres) throw erres;
                                if (args[1] === "get") {
                                    if (rowess[0] && !rowees[0]) {
                                        message.reply(name + " has " + rowess[0].strikes + " strikes.");
                                    } else if (!rowess[0] && rowees[0]) {
                                        message.reply(name + " has " + rowees[0].warns + " warns.");
                                    } else if (!rowess[0] && !rowees[0]) {
                                        message.reply("That user doesn't have any infractions.");
                                    } else if (rowess[0] && rowees[0]) {
                                        message.reply(name + " has " + rowess[0].strikes + " strikes and " + rowees[0].warns + " warns.");
                                    } else {
                                        message.reply("That user doesn't have any infractions.");
                                    }
                                } else if (args[1] === "clear") {
                                    if (args.length < 4) {
                                        message.reply("yo you need to add whether its warns or strikes or all.");
                                        return;
                                    } else if (args[3].toLowerCase() === "all") {
                                        sql = `DELETE FROM punishments WHERE name='${name}'`;
                                        con.query(sql);
                                        con.query(`DELETE FROM warns WHERE id='${rows[0].id}'`, (erres, rowes) => {
                                            if (erres) throw erres;
                                            message.reply("Cleared " + name + "'s infractions.");
                                        });
                                    } else if (args[3].toLowerCase() === "strikes") {
                                        sql = `DELETE FROM punishments WHERE name='${name}'`;
                                        con.query(sql);
                                        message.reply("Cleared " + name + "'s infractions.");
                                    } else if (args[3].toLowerCase() === "warns") {
                                        con.query(`DELETE FROM warns WHERE id='${rows[0].id}'`, (erres, rowes) => {
                                            if (erres) throw erres;
                                            message.reply("Cleared " + name + "'s infractions.");
                                        });
                                    } else {
                                        message.reply("Please specify whether it is warns, strikes, or all infractions.");
                                    }
                                }
                            });
                        })
                    }
                })
            } else if (mention) {
                con.query(`SELECT * FROM rbridge WHERE id='${mention.id}'`, (err, rows) => {
                    if (rows.length < 1) {
                        message.reply("Couldn't get that user!");
                        return;
                    } else {
                        name = rows[0].name;
                        con.query(`SELECT * FROM punishments WHERE name='${name}'`, (erre, rowess) => {
                            if (erre) throw erre;
                            con.query(`SELECT * FROM warns WHERE id='${rows[0].id}'`, (erres, rowees) => {
                                if (erres) throw erres;
                                if (args[1] === "get") {
                                    if (rowess[0] && !rowees[0]) {
                                        message.reply(name + " has " + rowess[0].strikes + " strikes.");
                                    } else if (!rowess[0] && rowees[0]) {
                                        message.reply(name + " has " + rowees[0].warns + " warns.");
                                    } else if (!rowess[0] && !rowees[0]) {
                                        message.reply("That user doesn't have any infractions.");
                                    } else if (rowess[0] && rowees[0]) {
                                        message.reply(name + " has " + rowess[0].strikes + " strikes and " + rowees[0].warns + " warns.");
                                    } else {
                                        message.reply("That user doesn't have any infractions.");
                                    }
                                } else if (args[1] === "clear") {
                                    if (args.length < 4) {
                                        message.reply("yo you need to add whether its warns or strikes or all.");
                                        return;
                                    } else if (args[3].toLowerCase() === "all") {
                                        sql = `DELETE FROM punishments WHERE name='${name}'`;
                                        con.query(sql);
                                        con.query(`DELETE FROM warns WHERE id='${rows[0].id}'`, (erres, rowes) => {
                                            if (erres) throw erres;
                                            message.reply("Cleared " + name + "'s infractions.");
                                        });
                                    } else if (args[3].toLowerCase() === "strikes") {
                                        sql = `DELETE FROM punishments WHERE name='${name}'`;
                                        con.query(sql);
                                        message.reply("Cleared " + name + "'s infractions.");
                                    } else if (args[3].toLowerCase() === "warns") {
                                        con.query(`DELETE FROM warns WHERE id='${rows[0].id}'`, (erres, rowes) => {
                                            if (erres) throw erres;
                                            message.reply("Cleared " + name + "'s infractions.");
                                        });
                                    } else {
                                        message.reply("Please specify whether it is warns, strikes, or all infractions.");
                                    }
                                }
                            });
                        })
                    }
                })
            }
        } else {
            message.reply("nice try but you aint got permissions");
        }
    }

    if (cmd.toLowerCase() === `${prefix}frename`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            let mention = message.mentions.members.first();
            if (!mention) {
                message.reply("You need to mention an user! Correct usage: `=frename <username> @user`");
                return;
            }
            con.query(`SELECT * FROM rbridge WHERE id='${mention.id}'`, (err, rows) => {
                if (rows.length < 1) {
                    message.reply("Couldn't get that user!");
                    return;
                } else {
                    sql = `UPDATE rbridge SET name = '${args[1]}' WHERE id='${mention.id}'`;
                    let p1 = rows[0].elo;
                    var asdf = message.guild.members.fetch(mention.id).then((user) => {
                        user.setNickname("[" + p1 + "] " + args[1]);
                    }).catch((err) => console.error(err));;
                    con.query(sql);
                    message.reply("Updated username.");
                }
            })
        } else {
            message.reply("nice try but you aint got permissions");
        }
    }

    if (cmd.toLowerCase() === `${prefix}call`) {
        if (args.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You need to mention an user!")
                .setDescription("Correct usage: `=call @user`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        } else {
            if (!message.member.voice || !message.member.voice.channel) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You need to be connected to a voice channel!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            }
            let mention = message.mentions.members.first();
            if (!mention) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Couldn't get that user!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            } else {
                if (
                    mention.voice.channel != null &&
                    mention.voice.channel != undefined
                ) {
                    if (mention.voice.channel.name.includes("Game")) {
                        message.member.voice.setChannel(mention.voice.channel.id).catch(err => console.error(err));
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Done.")
                            .setDescription("Moved you to <#" + mention.voice.channel.id + ">.")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed] });
                    } else {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user isn't in a Game VC!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed], files: [file] });
                    }
                } else {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("That user isn't connected to a VC!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed], files: [file] });
                }
            }
        }
    }

    if (cmd.toLowerCase() === `${prefix}status`) {
        if (args.length < 3) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Invalid arguments!")
                .setDescription("Correct usage: `=status <username> <timezone>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            getOnline(args[1], message, args[2]);
        }
    }

    if (cmd.toLowerCase() === `${prefix}checkname`) {
        if (args.length < 2) {
            message.reply("not enough arguments.")
            return;
        }
        getUsername(args[1], message).then((name) => {
            if (!name) {
                message.reply("That username doesn't exist anymore.");
                return;
            } else {
                message.reply(name + " exists.");
            }
        });
    }

    if (cmd.toLowerCase() === `${prefix}embed`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            message.reply("The following will guide you through making an embed.");
            const filter = (response) => {
                return response.content;
            };

            message.channel
                .send("What's the title of the embed?", { fetchReply: true })
                .then(() => {
                    message.channel
                        .awaitMessages({ filter, max: 1, errors: ["time"] })
                        .then((collected) => {
                            message.channel.send(
                                "Okay! The title of the embed will be `" +
                                collected.first().content +
                                "`."
                            );
                            const titleEmbed = collected.first().content;
                            message.channel
                                .send("What's the description of the embed?", {
                                    fetchReply: true,
                                })
                                .then(() => {
                                    message.channel
                                        .awaitMessages({ filter, max: 1, errors: ["time"] })
                                        .then((collected) => {
                                            const descriptionEmbed = collected.first().content;
                                            message.channel
                                                .send(
                                                    "Okay! That'll be the description. What's the footer of the embed?",
                                                    { fetchReply: true }
                                                )
                                                .then(() => {
                                                    message.channel
                                                        .awaitMessages({ filter, max: 1, errors: ["time"] })
                                                        .then((collected) => {
                                                            message.channel.send(
                                                                "Okay! The footer of the embed will be `" +
                                                                collected.first().content +
                                                                "`."
                                                            );
                                                            const footerEmbed = collected.first().content;
                                                            message.channel
                                                                .send(
                                                                    "What's the color of the embed? (provide a hex value)",
                                                                    { fetchReply: true }
                                                                )
                                                                .then(() => {
                                                                    message.channel
                                                                        .awaitMessages({
                                                                            filter,
                                                                            max: 1,
                                                                            errors: ["time"],
                                                                        })
                                                                        .then((collected) => {
                                                                            if (
                                                                                !collected.first().content.includes("#")
                                                                            ) {
                                                                                message.reply(
                                                                                    "Please provide a valid color!"
                                                                                );
                                                                                return;
                                                                            }
                                                                            message.channel.send(
                                                                                "Okay! The color of the embed will be `" +
                                                                                collected.first().content +
                                                                                "`."
                                                                            );
                                                                            const colorEmbed = collected.first()
                                                                                .content;
                                                                            message.channel
                                                                                .send(
                                                                                    "Okay! That'll be the color. What's the image of the embed? (type `none` in all lowercase to have no image)",
                                                                                    { fetchReply: true }
                                                                                )
                                                                                .then(() => {
                                                                                    message.channel
                                                                                        .awaitMessages({ filter, max: 1, errors: ["time"] })
                                                                                        .then((collected) => {
                                                                                            const imageEmbed = collected.first().content;
                                                                                            message.channel.send(
                                                                                                "Okay! The image of the embed will be `" +
                                                                                                collected.first().content +
                                                                                                "`."
                                                                                            );
                                                                                            message.channel
                                                                                                .send(
                                                                                                    "What's the channel of the embed?",
                                                                                                    { fetchReply: true }
                                                                                                )
                                                                                                .then(() => {
                                                                                                    message.channel
                                                                                                        .awaitMessages({
                                                                                                            filter,
                                                                                                            max: 1,
                                                                                                            errors: ["time"],
                                                                                                        })
                                                                                                        .then((collected) => {
                                                                                                            if (
                                                                                                                collected
                                                                                                                    .first()
                                                                                                                    .content.includes("<#") &&
                                                                                                                collected
                                                                                                                    .first()
                                                                                                                    .content.includes(">")
                                                                                                            ) {
                                                                                                                message.channel.send(
                                                                                                                    "Okay! The channel of the embed will be " +
                                                                                                                    collected.first().content +
                                                                                                                    "."
                                                                                                                );
                                                                                                                const channelEmbed = collected.first()
                                                                                                                    .content;

                                                                                                                let embed;
                                                                                                                if (imageEmbed === "none") {
                                                                                                                    embed = new MessageEmbed()
                                                                                                                        .setColor(colorEmbed)
                                                                                                                        .setTitle(titleEmbed)
                                                                                                                        .setDescription(
                                                                                                                            descriptionEmbed
                                                                                                                        )
                                                                                                                        .setFooter(footerEmbed);
                                                                                                                } else {
                                                                                                                    embed = new MessageEmbed()
                                                                                                                        .setImage(imageEmbed)
                                                                                                                        .setColor(colorEmbed)
                                                                                                                        .setTitle(titleEmbed)
                                                                                                                        .setDescription(
                                                                                                                            descriptionEmbed
                                                                                                                        )
                                                                                                                        .setFooter(footerEmbed);
                                                                                                                }

                                                                                                                let channelSplit = channelEmbed.split(
                                                                                                                    "<#"
                                                                                                                );
                                                                                                                let channelEnd = channelSplit[1].split(
                                                                                                                    ">"
                                                                                                                );
                                                                                                                if (
                                                                                                                    message.guild.channels.cache.get(
                                                                                                                        channelEnd[0]
                                                                                                                    )
                                                                                                                ) {
                                                                                                                    message.guild.channels.cache
                                                                                                                        .get(channelEnd[0])
                                                                                                                        .send({ embeds: [embed] });
                                                                                                                } else {
                                                                                                                    message.reply(
                                                                                                                        "Couldn't get the channel!"
                                                                                                                    );
                                                                                                                    return;
                                                                                                                }
                                                                                                            } else {
                                                                                                                message.reply(
                                                                                                                    "Please provide a valid channel."
                                                                                                                );
                                                                                                                return;
                                                                                                            }
                                                                                                        });
                                                                                                });
                                                                                        });
                                                                                });
                                                                        });
                                                                });
                                                        });
                                                })
                                                .catch((collected) => {
                                                    message.channel.send("Error getting data");
                                                });
                                        });
                                })
                                .catch((collected) => {
                                    message.channel.send("Error getting data");
                                });
                        })
                        .catch((collected) => {
                            message.channel.send("Error getting data");
                        });
                });
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}dump`) {
        if (message.member.roles.cache.some((r) => r.name === "Admin")) {
            const date = new Date().getTime();
            con.query(`SELECT * FROM rbridge ORDER BY elo DESC`, (err, rows) => {
                if (rows.length < 1) {
                    return;
                } else {
                    for (var i = 0; i < rows.length; i++) {
                        writeToFile(
                            "Username: " +
                            rows[i].name +
                            "\nID: " +
                            rows[i].id +
                            "\nELO: " +
                            rows[i].elo +
                            "\nDivision: " +
                            rows[i].division +
                            "\nWins: " +
                            rows[i].wins +
                            "\nLosses: " +
                            rows[i].losses +
                            "\nWinstreak: " +
                            rows[i].winstreak +
                            "\nBest Winstreak: " +
                            rows[i].bestws +
                            "\nGames Played: " +
                            rows[i].games +
                            "\n==========",
                            date
                        );
                    }
                    setTimeout(function () {
                        writeToFile(
                            "[===============]\nEND OF MAIN TABLE\n[===============]",
                            date
                        );
                        con.query(
                            `SELECT * FROM punishments ORDER BY strikes DESC`,
                            (err, rows) => {
                                if (rows.length < 1) {
                                    message.reply("Table is empty!");
                                    return;
                                } else {
                                    for (var i = 0; i < rows.length; i++) {
                                        writeToFile(
                                            "Username: " +
                                            rows[i].name +
                                            "\nStrikes: " +
                                            rows[i].strikes +
                                            "\n==========",
                                            date
                                        );
                                    }
                                    setTimeout(function () {
                                        writeToFile(
                                            "[===============]\nEND OF PUNISHMENTS TABLE\n[===============]",
                                            date
                                        );
                                        con.query(`SELECT * FROM banned`, (err, rows) => {
                                            if (rows.length < 1) {
                                                return;
                                            } else {
                                                for (var i = 0; i < rows.length; i++) {
                                                    writeToFile(
                                                        "Username: " +
                                                        rows[i].name +
                                                        "\nID: " +
                                                        rows[i].id +
                                                        "\n==========",
                                                        date
                                                    );
                                                }
                                                setTimeout(function () {
                                                    writeToFile(
                                                        "[===============]\nEND OF BANNED TABLE\n[===============]",
                                                        date
                                                    );
                                                }, 500);
                                            }
                                        });
                                    }, 500);
                                }
                            }
                        );
                    }, 500);
                }
            });
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Wrote to file successfully.")
                .setImage("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}cremove`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=cremove @user`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            } else {
                let argId = args[1];
                message.client.users.cache.delete(argId);
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Removed user from cache successfully.")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed] });
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}cget`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=cget @user`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            } else {
                let argId = args[1];
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Got user successfully from cache.")
                    .setDescription(
                        "User: `" + message.client.users.cache.get(argId) + "`"
                    )
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed] });
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}scoreinsert`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            let mention = message.mentions.members.first();
            if (!mention) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You need to mention an user!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            } else {
                con.query(
                    `INSERT INTO scorers(id, tag, games) VALUES('${mention.id}', '${mention.user.tag}', 0)`,
                    (err, rows) => {
                        if (err) throw err;
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Inserted " + mention.user.tag + " successfully.")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed] });
                    }
                );
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}ping`) {
        if (message.channel.id != queueChatChannel) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Wrong channel!")
                .setDescription("You can only ping Queue Ping in <#" + queueChatChannel + ">.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            var role = message.guild.roles.cache.find(
                (role) => role.name === "Queue Ping"
            );
            if (!role) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Couldn't get `Queue Ping` role.")
                    .setDescription("Contact Eltik or ping him.")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            } else {
                if (cooldown.includes(message.author.id)) {
                    message.delete();
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("You've pinged Queue Ping recently!")
                        .setDescription("Please wait until 1 minute is up.")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.channel.send({ embeds: [notSetEmbed], files: [file] });
                    return;
                } else {
                    message.delete();
                    message.channel.send("<@&" + role.id + ">");
                    cooldown.push(message.author.id);
                    const authorId = message.author.id;
                    setTimeout(function () {
                        for (var i = 0; i < cooldown.length; i++) {
                            if (cooldown[i] === authorId) {
                                cooldown.splice(i, 1);
                                // Remove them from the array and break.
                                break;
                            }
                        }
                    }, 60000);
                }
            }
        }
    }

    if (cmd.toLowerCase() === `${prefix}void`) {
        if (!message.channel.name.includes("game")) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You need to send this command in the game channel!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            if (
                !message.member.voice.channel ||
                !message.member.voice.channel.name.includes("Game")
            ) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You need to be connected to the Game VC to void a game!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            } else {
                for (var i = 0; i < voided.length; i++) {
                    if (
                        voided[i][1] === message.channel.name &&
                        voided[i][0] != message.author.id
                    ) {
                        const file = new MessageAttachment(
                            "../container/caution_gif.gif"
                        );
                        const asdfEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Someone is already voiding this game!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [asdfEmbed], files: [file] });
                        return;
                    }
                }
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("void")
                        .setLabel("Void Game")
                        .setStyle("DANGER")
                );

                const embed = new MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Void Game")
                    .setDescription(
                        "If you wish to void the game, click the button below."
                    );

                let teammates;
                for (var i = 0; i < teams.length; i++) {
                    if (teams[i][0] === message.member.id) {
                        teammates = teams[i][1];
                    }
                    if (teams[i][1] === message.member.id) {
                        teammates = teams[i][0];
                    }
                }
                await message.channel.send({
                    ephemeral: true,
                    embeds: [embed],
                    components: [row],
                });
                await voided.push([message.member.id, message.channel.name, teammates]);
            }
        }
    }

    // Help command
    if (cmd.toLowerCase() === `${prefix}help`) {
        // Create a new embed.
        var role = message.guild.roles.cache.find(
            (role) => role.name === "Queue Ping"
        );
        const helpEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("Help")
            .setDescription(
                "\n**help**\n> Displays this message.\n**register <username>**\n> Registers your account to Ranked Bridge.\n**rename <username>**\n> If you changed your account's IGN, use this command.\n**score**\n> Once a game is finished, use this command to score a game.\n**leadboard [elo/wins/losses/games/winstreak/scorer/worst]**\n> Displays the leaderboard for one of the values given.\n> alias: `lb`\n**stats [user]**\n > Displays stats for yourself or an user given.\n> alias: `i, info, s`\n**screenshare <user>**\n> Opens a screenshare ticket for someone.\n> alias: `ss`\n**report <user>**\n> Opens a report ticket for someone.\n**void**\n> Voids a game.\n**nick <hide/reset/some_value>**\n> Hide your ELO or add a word at the end of your nick.\n**ping**\n> Ping <@&" +
                role.id +
                ">. 1 minute cooldown.\n**call <@user>**\n> Join a call with a person in-game.\n**test**\n> sus"
            )
            .setFooter(
                "Prefix: `=`. `<>` means a required field, `[]` means an optional field."
            )
            .setTimestamp();
        // Send the embd.
        message.reply({ embeds: [helpEmbed] });
    }

    if (cmd.toLowerCase() === `${prefix}shelp`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            // Create a new embed.
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Staff Help")
                .setDescription(
                    "\n**shelp**\n> Displays this message.\n**infractions <get | clear> <user> <strikes | warns>**\n> Gets the infractions of an user or removes them.\n**vc**\n> Adds the bot to the VC (if the bot restarts).\n**fregister <username> @user**\n> Force registers another person's account.\n**frename <username> @user**\n> Force renames a person's account.\n**purge <username>**\n> Purges an user from the database based on their username.\n**purgeid <id>**\n> Purges an user from the database based on their ID.\n**set <elo | wins | losses | winstreak | games> <username> <amount>**\n> Sets an user's stats.\n**scoreinsert @user**\n> Inserts an user into the scorer database.\n**/delete**\n> Deletes a channel (requires confirmation).\n**/strike <user> [reason]**\n> Strikes an user.\n**/warn <user> [reason]**\n> Warns an user.\n**/mute <user> <time> [reason]**\n> Mutes an user for a given time.\n**/unmute <user>**\n> Unmutes an user.\n**/kick <user> [reason]**\n> Kicks an user from the server.\n**/ban <user> <time> [reason]**\n> Bans an user for a given time (gives them a role, doesn't permanently ban them).\n**/unban <user> [reason]**\n> Unbans an user.\n**/forceban <user> [reason]**\n> Permanently bans an user from the server.\n**/freeze <user>**\n> Freezes an user, preventing them from joining channels and sending messages.\n**/unfreeze <user>**\n> Unfreezes an user.\n**/saturday**\n> Turns on double ELO (currently not working).\n**/score <winner> <winner_teammate> <loser> <loser_teammate> <loser_score>**\n> Scores a game.\nSome of these commands may not be up to date! Ask Eltik if you are confused on a specific command."
                )
                .setFooter(
                    "Prefix: `=`. `<>` means a required field, `[]` means an optional field."
                )
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [helpEmbed] });
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to send this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    // Score command
    if (cmd.toLowerCase() === `${prefix}score`) {
        // If the channel isn't in a category...
        if (!message.channel.parent) {
            // If the channel doesn't include the name "game".
            if (!message.channel.name.includes("game")) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You can only score games in game channels!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            } else {
                // If there wasn't an attachment sent...
                if (!message.attachments.first()) {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Please attach an image to the message!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed], files: [file] });
                } else {
                    message.attachments.forEach(async attachment => {
                        const imageLink = attachment.proxyURL;
                        if (imageLink.toString().toLowerCase().endsWith(".png") || imageLink.toString().toLowerCase().endsWith(".jpg") || imageLink.toString().toLowerCase().endsWith(".jpeg")) {
                            // If the user isn't in a voice channel that includes the name "Game" or isn't in a voice channel at all...
                            if (
                                !message.member.voice.channel ||
                                !message.member.voice.channel.name.includes("Game")
                            ) {
                                const file = new MessageAttachment("../container/caution_gif.gif");
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle(
                                        "You need to be connected to the game VC to score games!"
                                    )
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed], files: [file] });
                            } else {
                                for (var i = 0; i < scoring.length; i++) {
                                    if (
                                        scoring[i][1] === message.channel.name &&
                                        scoring[i][0] != message.author.id
                                    ) {
                                        const file = new MessageAttachment(
                                            "../container/caution_gif.gif"
                                        );
                                        const asdfEmbed = new Discord.MessageEmbed()
                                            .setColor("#2f3136")
                                            .setTitle("Someone is already scoring this game!")
                                            .setThumbnail("attachment://caution_gif.gif")
                                            .setTimestamp();
                                        // Send the embd.
                                        message.reply({ embeds: [asdfEmbed], files: [file] });
                                        return;
                                    }
                                }
                                if (message.channel != null && message.channel != "null") {
                                    scoring.push([
                                        message.member.id,
                                        message.channel.name,
                                        message.member.voice.channel.name,
                                    ]);
                                    // Ping scorers, delete the voice channel they're in, and rewrite permissions.
                                    const row = new MessageActionRow().addComponents(
                                        new MessageButton()
                                            .setCustomId("score")
                                            .setLabel("Score Game")
                                            .setStyle("SUCCESS")
                                    );
                                    const scoreEmbed = new Discord.MessageEmbed()
                                        .setColor("#2f3136")
                                        .setTitle("Click the button if the screenshot is correct.")
                                        .setDescription(
                                            "If the opponent does not click the button, feel free to ping the Scorer role."
                                        )
                                        .setTimestamp();
                                    message.channel.send({
                                        ephemeral: true,
                                        embeds: [scoreEmbed],
                                        components: [row],
                                    });
                                }
                            }
                        } else {
                            const file = new MessageAttachment("../container/caution_gif.gif");
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("Please attach an image to the message!")
                                .setThumbnail("attachment://caution_gif.gif")
                                .setTimestamp();
                            // Send the embd.
                            message.reply({ embeds: [notSetEmbed], files: [file] });
                        }
                    });
                }
            }
        } else {
            // If the user didn't send a command in a game channel.
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Please send this command in your game channel!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    // Register command
    if (cmd.toLowerCase() === `${prefix}register`) {
        // If the command wasn't sent in the register channel...
        if (message.channel.id === registerChannel) {
            // Get the UUID of the user based on the second args, then get the username from MojangAPI and then get the user's Discord.
            getUUID(args[1], message).then((id) => {
                if (!id) {
                    return;
                }
                let trimmed = id;
                if (isString(trimmed)) {
                    let eight = trimmed.slice(0, 8);
                    let twelve = trimmed.slice(8, 12);
                    let sixteen = trimmed.slice(12, 16);
                    let twenty = trimmed.slice(16, 20);
                    let thirtytwo = trimmed.slice(20, 32);
                    let uuid =
                        eight +
                        "-" +
                        twelve +
                        "-" +
                        sixteen +
                        "-" +
                        twenty +
                        "-" +
                        thirtytwo;
                    getUsername(args[1], message).then((name) => {
                        if (!name) {
                            return;
                        }
                        getDiscord(id, message, name);
                    });
                }
            });
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Error!")
                .setDescription("You need to send this in <#" + registerChannel + ">.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    /*
    if (message.content === `${prefix}resetseason`) {
      const guild = client.guilds.cache.get("877034374720274452");
      let eloSet = `UPDATE rbridge SET elo = 1000`;
      let winsSet = `UPDATE rbridge SET wins = 0`;
      let lossesSet = `UPDATE rbridge SET losses = 0`;
      let winstreakSet = `UPDATE rbridge SET winstreak = 0`;
      let bestWsSet = `UPDATE rbridge SET bestws = 0`;
      let divisionSet = `UPDATE rbridge SET division = 'COAL'`;
      let gamesPlayed = `UPDATE rbridge SET games = 0`;
      con.query(eloSet);
      con.query(winsSet);
      con.query(lossesSet);
      con.query(winstreakSet);
      con.query(bestWsSet);
      con.query(divisionSet);
      con.query(gamesPlayed);
  
      var coalDiv = message.guild.roles.fetch("888644358671331338").then((coal) => {
        var ironDiv = message.guild.roles.fetch("888645414511853588").then((iron) => {
          var goldDiv = message.guild.roles.fetch("888645512910225459").then((gold) => {
            var diamondDiv = message.guild.roles.fetch("888646480750059570").then((diamond) => {
              var obsidianDiv = message.guild.roles.fetch("913131656859222046").then((obsidian) => {
                var emeraldDiv = message.guild.roles.fetch("925251645267394561").then((emerald) => {
                  var crystalDiv = message.guild.roles.fetch("925829994305970207").then((crystal) => {
                    guild.members.fetch().then(members =>
                    {
                      // Loop through every members
                      members.forEach(async member => {
                        var asdf = await message.guild.members.fetch(member.id).then((member) => {
                          if (!member.displayName) {
                            console.log("Couldn't get " + member.id + "'s display name.");
                            return;
                          }
                          if (member.roles.cache.some((r) => r.name === "Staff") || member.id === "593882880854196228") {
                            return;
                          }
                          if (member.displayName.includes("[8") || member.displayName.includes("[9")) {
                            var memberNick = member.displayName;
                            var splite = memberNick.split(" ");
                            member.setNickname('[1000] ' + splite[1]);
                            if (member.roles.cache.some((r) => r.name === "Iron Division") || member.roles.cache.some((r) => r.name === "Gold Division") || member.roles.cache.some((r) => r.name === "Diamond Division") || member.roles.cache.some((r) => r.name === "Emerald Division") || member.roles.cache.some((r) => r.name === "Obsidian Division") || member.roles.cache.some((r) => r.name === "Crystal Division")) {
                              member.roles.add(coal);
                              member.roles.remove(iron);
                              member.roles.remove(diamond);
                              member.roles.remove(obsidian);
                              member.roles.remove(gold);
                              member.roles.remove(emerald);
                              member.roles.remove(crystal);
                            }
                            console.log(member.displayName + " -> " + '[1000] ' + splite[1]);
                          }
                        });
                      });
                    });
                  }).catch((err) => console.error(err));
                }).catch((err) => console.error(err));
              }).catch((err) => console.error(err));
            }).catch((err) => console.error(err));
          }).catch((err) => console.error(err));
        }).catch((err) => console.error(err));
      }).catch((err) => console.error(err));
    }
    */

    // Rename command.
    if (cmd.toLowerCase() === `${prefix}rename`) {
        // If there are invalid arguments...
        if (args.length < 2 || args.length > 2) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Invalid arguments!")
                .setDescription("Correct usage: `=rename <ign>`")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        } else {
            // Get the ID of the user, than their username, and then rename the user.
            getUUID(args[1], message).then((id) => {
                let trimmed = id;
                if (!id) {
                    return;
                }
                if (isString(trimmed)) {
                    let eight = trimmed.slice(0, 8);
                    let twelve = trimmed.slice(8, 12);
                    let sixteen = trimmed.slice(12, 16);
                    let twenty = trimmed.slice(16, 20);
                    let thirtytwo = trimmed.slice(20, 32);
                    let uuid =
                        eight +
                        "-" +
                        twelve +
                        "-" +
                        sixteen +
                        "-" +
                        twenty +
                        "-" +
                        thirtytwo;
                    getUsername(args[1], message).then((name) => {
                        if (!name) {
                            return;
                        }
                        rename(id, message, name);
                    });
                }
            });
        }
    }
    //If the command =leaderboard or =lb is typed then get the leaderboard
    if (cmd.toLowerCase() === `${prefix}leaderboard` || cmd.toLowerCase() === `${prefix}lb`) {
        //Check the length of the arguement passed
        if (args.length < 2 || args.length > 2) {
            // Get the ELO leaderboard if there are no arguments.
            getELOLeaderboard(message);
        } else {
            // Get the arguments, then send the appropriate leaderboard based on the argument sent.
            if (args[1] === "elo") {
                getELOLeaderboard(message);
            } else if (args[1] === "wins" || args[1] === "win") {
                getWinsLeaderboard(message);
            } else if (args[1] === "losses" || args[1] === "loss") {
                getLossesLeaderboard(message);
            } else if (args[1] === "winstreak" || args[1] === "ws") {
                getWinstreakLeaderboard(message);
            } else if (args[1] === "games" || args[1] === "game") {
                getGamesLeaderboard(message);
            } else if (args[1] === "worst" || args[1] === "worstelo") {
                getWorstELOLeaderboard(message);
            } else if (
                args[1] === "scores" ||
                args[1] === "score" ||
                args[1] === "scorer"
            ) {
                getScoreLeaderboard(message);
            } else {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Unknown gamemode!")
                    .setDescription(
                        "Gamemodes include: `elo, wins, winstreak, games, scorer, worstelo`. Alias: `win, loss, ws, game, scores/score, worst`. *W/L will be included hopefully soon!* (along with pages)"
                    )
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            }
        }
    }
    //If the command =stats, =info, =i, =s is passed...
    if (
        cmd.toLowerCase() === `${prefix}stats` ||
        cmd.toLowerCase() === `${prefix}info` ||
        cmd.toLowerCase() === `${prefix}i` ||
        cmd.toLowerCase() === `${prefix}s`
    ) {
        if (args.length < 2 || args.length > 2) {
            getStatsMention(message, message.author);
        } else {
            let mention = message.mentions.users.first();
            if (!mention) {
                getStats(message, args[1]);
            } else {
                getStatsMention(message, mention);
            }
        }
    }

    if (cmd.toLowerCase() === `${prefix}report`) {
        if (args.length < 2) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Invalid arguments!")
                .setDescription(
                    "Correct usage: `=report [username]`."
                )
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        } else {
            let mention = message.mentions.members.first();
            if (!mention) {
                con.query(`SELECT * FROM rbridge WHERE name = ?`, [args[1]], function (err, rows, fields) {
                    if (rows.length < 1) {
                        console.log("User doesn't exist!");
                        const file = new MessageAttachment(
                            "../container/caution_gif.gif"
                        );
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("That user doesn't exist!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    } else {
                        createReportChannel(message, message.author.id, rows[0].id);
                    }
                }
                );
            } else {
                createReportChannel(message, message.author.id, mention.id);
            }
        }
    }

    if (cmd.toLowerCase() === `${prefix}set`) {
        if (args.length < 5) {
            if (message.member.roles.cache.some((r) => r.name === "Staff") || message.member.roles.cache.some((r) => r.name === "Scorer")) {
                if (args[1] === "elo") {
                    setElo(message, args[2], args[3]);
                } else if (args[1] === "wins") {
                    setWins(message, args[2], args[3]);
                } else if (args[1] === "losses") {
                    setLosses(message, args[2], args[3]);
                } else if (args[1] === "winstreak") {
                    setWinstreak(message, args[2], args[3]);
                } else if (args[1] === "games") {
                    setGames(message, args[2], args[3]);
                } else {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Invalid arguments!")
                        .setDescription(
                            "Correct usage: `=set <elo/wins/losses/winstreak/games> <username> <amount>`"
                        )
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed], files: [file] });
                    return;
                }
            } else {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("You don't have permission to use this command!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Invalid arguments!")
                .setDescription(
                    "Correct usage: `=set <elo/wins/losses/games/winstreak> <username> <amount>`"
                )
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        }
    }

    if (cmd.toLowerCase() === `${prefix}purgeid`) {
        if (message.member.roles.cache.some((r) => r.name === "Moderator") || message.member.roles.cache.some((r) => r.name === "Admin")) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=purgeid <username>`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            } else {
                purgeID(message, args[1]);
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        }
    }

    if (cmd.toLowerCase() === `${prefix}purge`) {
        if (message.member.roles.cache.some((r) => r.name === "Admin") || message.member.roles.cache.some((r) => r.name === "Moderator")) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=purge <username>`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
                return;
            } else {
                purge(message, args[1]);
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        }
    }

    if (cmd.toLowerCase() === `${prefix}fregister`) {
        if (message.member.roles.cache.some((r) => r.name === "Staff")) {
            if (args.length < 3) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=fregister <username> @user`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            } else {
                let user = message.mentions.members.first();
                if (!user) {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Couldn't get `" + user + "`! Maybe they left?")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.reply({ embeds: [notSetEmbed], files: [file] });
                    return;
                }
                var role = message.member.guild.roles.cache.find(
                    (role) => role.id === rankedPlayer
                );
                var coalDiv = coalDivision;
                user.roles.add(role);
                user.roles.add(role);
                user.roles.add(coalDiv);
                user.roles.add(coalDiv);
                console.log("Added the role to the user.");
                user.roles.remove(unverified);

                var roleRanked = message.member.guild.roles.cache.find(
                    (role) => role.id === rankedPlayer
                );
                con.query(
                    `SELECT * FROM rbridge WHERE id = '${user.id}'`,
                    (err, rows) => {
                        if (err) throw err;

                        let sql;

                        if (rows.length < 1) {
                            sql = `INSERT INTO rbridge (id, elo, name) VALUES ('${user.id}', '1000', '${args[1]}')`;
                            console.log("Inserting " + user.id + "...");
                            con.query(sql);
                            // Create a new embed.
                            const registeredEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("Inserted `" + args[1] + "` successfully.")
                                .setTimestamp();
                            // Send the embed.
                            message.reply({ embeds: [registeredEmbed] });
                            user.setNickname("[1000] " + args[1]);
                        } else {
                            // Add the role and set the nickname.
                            user.roles.add(roleRanked);
                            user.roles.remove(unverified);
                            user.setNickname("[" + rows[0].elo + "] " + args[1]);
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle(
                                    "`" +
                                    args[1] +
                                    "` was already registered! Re-registered them."
                                )
                                .setTimestamp();
                            // Send the embd.
                            message.reply({ embeds: [notSetEmbed] });
                        }
                    }
                );
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission to use this command!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }

    if (cmd.toLowerCase() === `${prefix}nick`) {
        if (
            message.member.roles.cache.some((r) => r.name === "Staff") ||
            message.member.roles.cache.some((r) => r.name === "Booster") ||
            message.member.roles.cache.some((r) => r.name === "Booster Perks")
        ) {
            if (args.length < 2) {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Invalid arguments!")
                    .setDescription("Correct usage: `=nick <hide/reset/some_word>`")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                message.reply({ embeds: [notSetEmbed], files: [file] });
            } else {
                if (args[1] === "hide") {
                    con.query(
                        `SELECT * FROM rbridge WHERE id = '${message.author.id}'`,
                        (err, rows) => {
                            if (err) throw err;
                            if (rows.length < 1) {
                                const file = new MessageAttachment(
                                    "../container/caution_gif.gif"
                                );
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("You're not in the database!")
                                    .setDescription("Please re-register.")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed], files: [file] });
                                return;
                            } else {
                                message.member.setNickname(rows[0].name);
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Hid your ELO.")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed] });
                            }
                        }
                    );
                } else if (args[1] === "reset") {
                    con.query(
                        `SELECT * FROM rbridge WHERE id = '${message.author.id}'`,
                        (err, rows) => {
                            if (err) throw err;
                            if (rows.length < 1) {
                                const file = new MessageAttachment(
                                    "../container/caution_gif.gif"
                                );
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("You're not in the database!")
                                    .setDescription("Please re-register.")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.reply({ embeds: [notSetEmbed], files: [file] });
                                return;
                            } else {
                                message.member.setNickname(
                                    "[" + rows[0].elo + "] " + rows[0].name
                                );
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("Reset your nickname.")
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.channel.send({ embeds: [notSetEmbed] });
                            }
                        }
                    );
                } else {
                    if (message.member.displayName.includes("(")) {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("You already have a nick!")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed], files: [file] });
                        return;
                    }
                    if ((message.member.displayName + args[1]).length < 32) {
                        message.member.setNickname(
                            message.member.displayName + " (" + args[1] + ")"
                        );
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(
                                "Set your nickname to `" +
                                message.member.displayName +
                                " (" +
                                args[1] +
                                ")`."
                            )
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed] });
                    } else {
                        const file = new MessageAttachment("../container/caution_gif.gif");
                        const notSetEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle("Your current nickname is too long!")
                            .setDescription("Use `=nick reset` to reset your nickname.")
                            .setThumbnail("attachment://caution_gif.gif")
                            .setTimestamp();
                        // Send the embd.
                        message.reply({ embeds: [notSetEmbed], files: [file] });
                    }
                }
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("You don't have permission!")
                .setDescription("You need to be a Booster to use this command.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }
});

// PARTY QUEUEING
client.on('voiceStateUpdate', async (oldState, newState) => {
    con.query(`SELECT * FROM rbridge WHERE id = '${newState.member.id}'`, async (err, rows) => {
        if (oldState.member.id === "877315883859603466" || oldState.member.id === "892906797764055050") {
            return;
        }
        if (rows.length < 1) {
            if (!newState || !oldState) {
                let isLimit = false;
                for (var i = 0; i < limit.length; i++) {
                    if (limit[i] === newState.member.id) {
                        isLimit = true;
                    }
                }
                if (!isLimit) {
                    limit.push(newState.member.id);
                    // If the user isn't registered
                    newState.member.guild.channels.cache
                        .get(queueChatChannel)
                        .send(
                            "<@" +
                            newState.member.id +
                            ">, you're not registered! Register in <#" + registerChannel + ">!"
                        );
                    setTimeout(async function () {
                        for (var i = 0; i < limit.length; i++) {
                            if (limit[i] === newState.member.id) {
                                limit.splice(i, 1);
                            }
                        }
                    }, 10000);
                    return;
                } else {
                    return;
                }
            } else {
                let isLimit = false;
                for (var i = 0; i < limit.length; i++) {
                    if (limit[i] === newState.member.id) {
                        isLimit = true;
                    }
                }
                if (!isLimit) {
                    limit.push(newState.member.id);
                    // If the user isn't registered
                    newState.member.guild.channels.cache
                        .get(queueChatChannel)
                        .send(
                            "<@" +
                            newState.member.id +
                            ">, you're not registered! Register in <#" + registerChannel + ">!"
                        );

                    setTimeout(async function () {
                        for (var i = 0; i < limit.length; i++) {
                            if (limit[i] === newState.member.id) {
                                limit.splice(i, 1);
                            }
                        }
                    }, 10000);
                    newState.disconnect();
                    return;
                } else {
                    newState.disconnect();
                }
            }
            return;
        } else {
            // If the user has the Ghost role...
            if (newState.member.roles.cache.has(ghost)) {
                return;
            }
            if (oldState.channelID === null || typeof oldState.channelID === 'undefined') {
                let memberID = oldState.member.id;
                if (memberID === "877315883859603466") {
                    const connection = joinVoiceChannel(
                        {
                            channelId: queueChannel,
                            guildId: "877034374720274452",
                            adapterCreator: oldState.guild.voiceAdapterCreator
                        });
                }
                // Get the user ID.
                if (exists(test, memberID) && !exists(isMoving, memberID)) {
                    // Check whether the user exists in the array.
                    for (var i = 0; i < test.length; i++) {
                        // Loop through the array.
                        if (test[i][0] === memberID) {
                            // If the ID of the current loop is equal to the memberID...
                            console.log("User left the voice channel. Removing them from the array...");
                            test.splice(i, 1);
                            newState.guild.members.fetch(clientId).then((member) => {
                                member.setNickname("[" + test.length + "/2]");
                            }).catch((e) => console.log("Error setting the nickname!"));

                            setTimeout(async function () {
                                let channelThing = await newState.guild.channels.cache.find((name) => name.name === memberID);
                                if (!channelThing) {
                                    return;
                                }
                                channelThing.delete().catch((err) => console.error(err));
                            }, 4000);
                            // Remove them from the array and break.
                            break;
                        }
                    }
                }
            }

            if (newState.channel) {
                if (newState.channel.name === newState.member.id) {
                    for (var k = 0; k < isMoving.length; k++) {
                        if (isMoving[k] === newState.member.id) {
                            isMoving.splice(k, 1);
                        }
                    }
                }
            }
            // If the channel the user is in is equal to the queue channel...
            if (newState.channelId === queueChannel) {
                if (newState.member.id === "877315883859603466" || oldState.member.id === "877315883859603466" || newState.member.id === "892906797764055050" || oldState.member.id === "892906797764055050") {
                    return;
                }
                let memberID = newState.member.id;
                if (!exists(test, memberID)) {
                    // If the user doesn't exist in the array...
                    console.log(memberID + " joined the queue VC.");

                    // Check if the user exists in the database...
                    con.query(`SELECT * FROM rbridge WHERE id = '${newState.member.id}'`, (err, rows) => {
                        if (err) throw err;
                        if (rows.length < 1) {
                            return;
                        }
                        let ready = false;
                        let skipse = 0;
                        let userElo = rows[0].elo;
                        // Add the user to the queue array.
                        test.push([memberID, userElo, 0]);

                        // Set the bot's nickname
                        newState.guild.members.fetch("877315883859603466").then((member) => {
                            member.setNickname("[" + test.length + "/2]");
                        }).catch((e) => console.log("Error setting the nickname!"));

                        if (newState.member.roles.cache.some((r) => r.name === "Invisible")) {
                            isMoving.push(memberID);
                            newState.guild.channels.create(newState.member.id, {
                                type: "GUILD_VOICE",
                                permissionOverwrites: [
                                    {
                                        id: newState.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                                        deny: ["VIEW_CHANNEL", "CONNECT", "SPEAK"], //Deny permissions
                                    },
                                    {
                                        id: rankedPlayer,
                                        deny: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                    },
                                ],
                            }).then((channel) => {
                                channel.setParent(queueCategory);
                                newState.setChannel(channel.id).catch((e) => console.error(e));
                            });
                        }
                        // Run the following loop multiple times.
                        var timer = setInterval(function () {
                            let member = newState.member;
                            // Get the user ID...
                            // Add them to a 2D arrary with the values: [id, elo, skips]

                            // If there is more then one person in the VC...
                            if (test.length > 1) {
                                // Sort the array based on ELO.
                                test.sort((a, b) => a[1] - b[1]);
                                // memberIndex is the current index we're looping through.
                                var memberIndex;
                                // Set the difference of the two people we're comparing. If the current index we're looping through is 0 or the last index,
                                // then the difference will be the following:
                                var diff1 = 10000000;
                                var diff2 = 10000000;
                                for (var i = 0; i < test.length; i++) {
                                    // Loop through the array.
                                    if (test[i][0] === memberID) {
                                        // Set the memberIndex equal to i.
                                        memberIndex = i;
                                        // If the memberIndex isn't equal to 0...
                                        if (memberIndex != 0) {
                                            // The difference is the absolute value of the current user's ELO and the user with the ELO closest to the current user.
                                            // (Hence why we sorted the queue)
                                            diff1 = Math.abs(test[memberIndex][1] - test[memberIndex - 1][1]);
                                        }
                                        // If the memberIndex + 1 is less than the test length (if you can get the user closest to the user AFTER the current user)
                                        if (memberIndex + 1 < test.length) {
                                            // Get the absolute value of the current user's ELO and the user AFTER the current user
                                            // (Hence why we sorted the queue)
                                            diff2 = Math.abs(test[memberIndex][1] - test[memberIndex + 1][1]);
                                        }
                                        // If the difference of the user BEFORE the user is less than or equal to the difference of the user AFTER the user...
                                        if (diff1 <= diff2) {
                                            // If newMember elo is closest to elo above it...
                                            if (diff1 < (range + (test[memberIndex - 1][2] + test[memberIndex][2]) * skipse * 5)) {
                                                // If the difference is less than 40 and accounts for skips...
                                                console.log("Matched " + test[memberIndex][0] + " and " + test[memberIndex - 1][0] + "!");
                                                // Get the two users.
                                                const user1 = test[memberIndex - 1][0];
                                                const user2 = test[memberIndex][0];
                                                // Remove them from the array.
                                                test.splice(memberIndex - 1, 2);
                                                // Create the channels.
                                                makeChannel(newState.member, user1, user2);
                                                clearInterval(timer);
                                            } else {
                                                // If newMember elo is closest to the elo below it...
                                                // Add skips to both users.
                                                test[memberIndex][2]++;
                                                test[memberIndex - 1][2]++;
                                                skipse++;
                                                console.log("Updated skips since we weren't able to match users.");
                                            }
                                        }
                                        if (diff2 < diff1) {
                                            // If newMember elo is closest to elo below it...
                                            if (diff2 < (range + (test[memberIndex + 1][2] + test[memberIndex][2]) * skipse * 5)) {
                                                // If the difference is less than 40 and accounts for skips...
                                                console.log("Matched " + test[memberIndex][0] + " and " + test[memberIndex + 1][0] + "!");
                                                const user1 = test[memberIndex + 1][0];
                                                const user2 = test[memberIndex][0];
                                                test.splice(memberIndex, 2);
                                                makeChannel(newState.member, user1, user2);
                                                clearInterval(timer);
                                                break;
                                            } else {
                                                test[memberIndex][2]++;
                                                test[memberIndex + 1][2]++;
                                                skipse++;
                                                console.log("Updated skips since we weren't able to match users.");
                                            }
                                        }
                                    }
                                }
                            }
                        }, 2000);
                    })
                } else {
                    console.log(memberID + " was already in the array.");
                }
            }
        }
    });
});

// Checks whether users exist.
function exists(arr, search) {
    return arr.some((row) => row.includes(search));
}

// Get an user from the mention.
function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        if (mention.startsWith("!")) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

function getMentionReturn(message, mention) {
    if (!mention) return "none";

    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        if (mention.startsWith("!")) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

// Make the channel
async function makeChannel(message, player1, player2) {
    for (var i = 0; i < test.length; i++) {
        // Loop through the array.
        if (test[i][0] === player1 || test[i][0] === player2) {
            test.splice(i, 1);
            // Remove them from the array and break.
            break;
        }
    }
    for (var k = 0; k < isMoving.length; k++) {
        if (isMoving[k] === player1 || isMoving[k] === player2) {
            isMoving.splice(k, 1);
        }
    }
    message.guild.members.fetch(clientId).then((member) => {
        member.setNickname("[" + test.length + "/2]");
    }).catch((e) => console.log("Error setting the nickname!"));

    console.log(
        player1 + " vs " + player2
    );
    // Get the two users based on their ID.
    let user1Sucks = await message.guild.members
        .fetch(player1)
        .then(async (user) => {
            let user2Sucks = await message.guild.members
                .fetch(player2)
                .then(async (user2) => {
                    gamesE++;
                    con.query(`SELECT * FROM games`, (err, rows) => {
                        let game = gamesE;
                        // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
                        logFile(
                            "Game " +
                            game +
                            " started. " + player1 + " against " + player2 + "."
                        );

                        let messageID;
                        let channel1ID;
                        let channel2ID;

                        message.guild.channels.create("game-" + gamesE, {
                            permissionOverwrites: [
                                {
                                    id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                                    deny: [
                                        "VIEW_CHANNEL",
                                        "SEND_MESSAGES",
                                        "READ_MESSAGE_HISTORY",
                                    ], //Deny permissions
                                },
                                {
                                    // But allow the two users to view the channel, send messages, and read the message history.
                                    id: user.id,
                                    allow: [
                                        "VIEW_CHANNEL",
                                        "SEND_MESSAGES",
                                        "READ_MESSAGE_HISTORY",
                                    ],
                                },
                                {
                                    id: user2.id,
                                    allow: [
                                        "VIEW_CHANNEL",
                                        "SEND_MESSAGES",
                                        "READ_MESSAGE_HISTORY",
                                    ],
                                },
                                {
                                    id: staff,
                                    allow: [
                                        "VIEW_CHANNEL",
                                        "SEND_MESSAGES",
                                        "READ_MESSAGE_HISTORY",
                                    ],
                                },
                                {
                                    id: scorer,
                                    allow: [
                                        "VIEW_CHANNEL",
                                        "SEND_MESSAGES",
                                        "READ_MESSAGE_HISTORY",
                                    ],
                                },
                            ],
                        }).then((messageThing) => {
                            messageID = messageThing.id;
                            // Create the Game x VC
                            message.guild.channels.create("Game " + game + " Team 1", {
                                type: "GUILD_VOICE",
                                permissionOverwrites: [
                                    {
                                        id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                                        deny: ["CONNECT", "SPEAK"], //Deny permissions
                                    },
                                    {
                                        id: user.id,
                                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                    },
                                    {
                                        id: user2.id,
                                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                    },
                                    {
                                        id: staff,
                                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                    },
                                    {
                                        id: scorer,
                                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                    },
                                ],
                            }).then((channel1) => {
                                channel1ID = channel1.id;
                                message.guild.channels.create("Game " + game + " Team 2", {
                                    type: "GUILD_VOICE",
                                    permissionOverwrites: [
                                        {
                                            id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                                            deny: ["CONNECT", "SPEAK"], //Deny permissions
                                        },
                                        {
                                            id: user.id,
                                            allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                        },
                                        {
                                            id: user2.id,
                                            allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                        },
                                        {
                                            id: staff,
                                            allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                        },
                                        {
                                            id: scorer,
                                            allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                                        },
                                    ],
                                }).then((channel2) => {
                                    channel2ID = channel2.id;
                                    // Insert into game database
                                    sql = `INSERT INTO games (winnerid, loserid, winnerelo, loserelo, gameid) VALUES ('${player1}', '${player2}', 0, 0, ${game})`;
                                    con.query(sql, (err) => {
                                        if (err) throw err;
                                    });
                                    // Move the users to that VC after 2 seconds.
                                    console.log("Current game: " + game);
                                    // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
                                    var channelIDT = message.guild.channels.cache.find(
                                        (c) => c.name === "Game " + game + " Team 1"
                                    );
                                    var channel2IDT = message.guild.channels.cache.find(
                                        (c) => c.name === "Game " + game + " Team 2"
                                    );

                                    const notSetEmbed = new Discord.MessageEmbed()
                                        .setColor("#2f3136")
                                        .setTitle("Game #" + game)
                                        .setDescription(
                                            "Duel the other person using `/duel <user> bridge`. Once the game is done, **send a screenshot of the score** using `=score`. If you do not do so, your game may not get scored. Confused on how to play? Visit <#877038997908627476>."
                                        )
                                        .setThumbnail("https://media.giphy.com/media/yoVPoF08mSummEFQil/giphy-downsized-large.gif")
                                        .setImage("https://media.giphy.com/media/ECkObcUAmQkbmgiWGo/giphy.gif")
                                        .setTimestamp();
                                    // Send the embd.
                                    message.guild.channels.cache
                                        .get(messageID)
                                        .send({ embeds: [notSetEmbed] });

                                    var attacker = message.guild.roles.cache.find(
                                        (role) => role.name === "Attacker"
                                    );
                                    var defender = message.guild.roles.cache.find(
                                        (role) => role.name === "Defender"
                                    );
                                    var hybrid = message.guild.roles.cache.find(
                                        (role) => role.name === "Hybrid"
                                    );
                                    if (!attacker) {
                                        console.log("Couldn't get Attacker role.");
                                    } else if (!defender) {
                                        console.log("Couldn't get Defender role.");
                                    } else if (!hybrid) {
                                        console.log("Couldn't get Hybrid role.");
                                    }
                                    let userRole = "NONE";
                                    let user2Role = "NONE";

                                    if (user.roles.cache.has(attacker.id)) {
                                        userRole = "Attacker";
                                    } else if (user.roles.cache.has(defender.id)) {
                                        userRole = "Defender";
                                    } else if (user.roles.cache.has(hybrid.id)) {
                                        userRole = "Hybrid";
                                    }
                                    if (user2.roles.cache.has(attacker.id)) {
                                        user2Role = "Attacker";
                                    } else if (user2.roles.cache.has(defender.id)) {
                                        user2Role = "Defender";
                                    } else if (user2.roles.cache.has(hybrid.id)) {
                                        user2Role = "Hybrid";
                                    }

                                    const notSetEmbede = new Discord.MessageEmbed()
                                        .setColor("#2f3136")
                                        .setTitle("Roles")
                                        .setDescription("<@" + player1 + "> is `" + userRole + "`.\n<@" + player2 + "> is `" + user2Role + "`.")
                                        .setTimestamp();
                                    // Send the embd.
                                    message.guild.channels.cache
                                        .get(messageID)
                                        .send({ embeds: [notSetEmbede] });
                                    try {
                                        user.voice.setChannel(channel1ID).catch((err) => console.error(err));
                                        user2.voice.setChannel(channel2ID).catch((err) => console.error(err));
                                    } catch (err) {
                                        console.error(err);
                                    }
                                    if (!channelIDT || !channel2IDT) {
                                        user.voice.setChannel(channel1ID).catch((err) => console.error(err));
                                        user2.voice.setChannel(channel2ID).catch((err) => console.error(err));
                                        console.log("Moved the users.");
                                    } else {
                                        user.voice.setChannel(channelIDT.id).catch((err) => console.error(err));
                                        user2.voice.setChannel(channel2IDT.id).catch((err) => console.error(err));
                                        console.log("Moved the users via cache.");
                                    }
                                    con.query(`SELECT * FROM rbridge WHERE id = '${player1}'`, (err, rows) => {
                                        if (rows.length < 1) {
                                            console.log("User doesn't exist!");
                                            return;
                                        }
                                        let ign1 = rows[0].name;
                                        con.query(`SELECT * FROM rbridge WHERE id = '${player2}'`, (err, rowes) => {
                                            if (rowes.length < 1) {
                                                console.log("User doesn't exist!");
                                                return;
                                            }
                                            let ign2 = rowes[0].name;

                                            const someEmbed = new Discord.MessageEmbed()
                                                .setColor("#2f3136")
                                                .setTitle("Commands")
                                                .setDescription("`/duel " + ign1 + " bridge`\n`/duel " + ign2 + " bridge`")
                                                .setTimestamp();
                                            message.guild.channels.cache.get(messageID).send({ embeds: [someEmbed] });
                                            message.guild.channels.cache.get(messageID).send("[<@" + player1 + "> - <@" + player2 + ">]");
                                            setTimeout(async function () {
                                                let channelThing = await message.guild.channels.cache.find((name) => name.name === player1);
                                                if (!channelThing) {
                                                    return;
                                                }
                                                channelThing.delete().catch((err) => console.error(err));
                                            }, 4000);
                                            setTimeout(async function () {
                                                let channelThing2 = await message.guild.channels.cache.find((name) => name.name === player2);
                                                if (!channelThing2) {
                                                    return;
                                                }
                                                channelThing2.delete().catch((err) => console.error(err));
                                            }, 4000);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
        });
}

// Report channel
function createReportChannel(message, id, id2) {
    // Get the two users based on their ID.
    var user = message.guild.members.cache.get(id);

    con.query(`SELECT * FROM rbridge WHERE id = '${id2}'`, (err, rows) => {
        if (rows.length < 1) {
            console.log("User doesn't exist!");
            message.reply("That user doesn't exist!");
            return;
        }
        let lowercase = rows[0].name.toLowerCase();
        logFile(user.displayName + " is reporting " + rows[0].name + ".");
        let title = "report-" + lowercase;
        console.log(user.displayName + " is reporting " + rows[0].name + ".");
        var user2 = client.users
            .fetch(id2)
            .then((user2e) => {
                // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
                message.guild.channels.create(title, {
                    permissionOverwrites: [
                        {
                            id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"], //Deny permissions
                        },
                        {
                            // But allow the two users to view the channel, send messages, and read the message history.
                            id: user.id,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        },
                        {
                            // But allow the two users to view the channel, send messages, and read the message history.
                            id: user2e.id,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        },
                        {
                            id: staff,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        },
                    ],
                });
            })
            .catch(console.error);
        // Move the users to that VC.
        setTimeout(function () {
            // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
            var channelID = message.guild.channels.cache.find((c) => c.name === title)
                .id;
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(`Please fill out the following:`)
                .setDescription('`1.` The reason you\'re reporting the user.\n`2.` Proof of the user breaking the rules (if it\'s something in-game, provide the replay of the game.)\n`3.` The user you are reporting.\n**Staff will be with you shortly.** If someone does not respond within 5 minutes, feel free to ping one of the Staff members. Spam pinging will result in a punishment.')
                .setTimestamp();
            // Send the embd.
            message.guild.channels.cache.get(channelID).send({ embeds: [errorEmbed] });
        }, 2000);
    });
}

async function addQueuePing(interaction, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "Queue Ping");
    if (!role) {
        console.log("Couldn't get Queue Ping role.");
    }
    if (user.roles.cache.has(role.id)) {
        logFile(id + " had Queue Ping role. Removed it.");
        console.log("User had Queue Ping role. Removed it.");
        await interaction.editReply("➖ Removed <@&" + role.id + ">.");
        user.roles.remove(role);
    } else {
        logFile(id + " didn't have Queue Ping role. Added it.");
        console.log("User didn't have Queue Ping role. Added it.");
        await interaction.editReply("➕ Added <@&" + role.id + ">.");
        user.roles.add(role);
    }
}

async function addAnnouncementPing(interaction, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "Announcement Ping");
    if (!role) {
        console.log("Couldn't get Announcement Ping role.");
    }
    if (user.roles.cache.has(role.id)) {
        logFile(id + " had Announcement Ping role. Removed it.");
        console.log("User had Announcement Ping role. Removed it.");
        await interaction.editReply("➖ Removed <@&" + role.id + ">.");
        user.roles.remove(role);
    } else {
        logFile(id + " didn't have Announcement Ping role. Added it.");
        console.log("User didn't have Announcement Ping role. Added it.")
        await interaction.editReply("➕ Added <@&" + role.id + ">.");
        user.roles.add(role);
    }
}

async function addInvisible(interaction, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "Invisible");
    if (!role) {
        console.log("Couldn't get Invisible role.");
    }
    if (user.roles.cache.has(role.id)) {
        logFile(id + " had Invisible role. Removed it.");
        console.log("User had Invisible role. Removed it.");
        await interaction.editReply("➖ Removed <@&" + role.id + ">.");
        user.roles.remove(role);
    } else {
        logFile(id + " didn't have Invisible role. Added it.");
        console.log("User didn't have Invisible role. Added it.");
        await interaction.editReply("➕ Added <@&" + role.id + ">.");
        user.roles.add(role);
    }
}

async function addDontPing(interaction, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "DON'T PING");
    if (!role) {
        console.log("Couldn't get Don't Ping role.");
    }
    if (user.roles.cache.has(role.id)) {
        logFile(id + " had Don't Ping role. Removed it.");
        console.log("User had Don't Ping role. Removed it.");
        await interaction.editReply("➖ Removed <@&" + role.id + ">.");
        user.roles.remove(role);
    } else {
        logFile(id + " didn't have Don't Ping role. Added it.");
        console.log("User didn't have Don't Ping role. Added it.");
        await interaction.editReply("➕ Added <@&" + role.id + ">.");
        user.roles.add(role);
    }
}

async function addScorerPing(interaction, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "Scorer Ping");
    if (!role) {
        console.log("Couldn't get Scorer Ping role.");
    }
    if (user.roles.cache.has(role.id)) {
        logFile(id + " had Scorer Ping role. Removed it.");
        console.log("User had Scorer Ping role. Removed it.");
        await interaction.editReply("➖ Removed <@&" + role.id + ">.");
        user.roles.remove(role);
    } else {
        logFile(id + " didn't have Scorer Ping role. Added it.");
        console.log("User didn't have Scorer Ping role. Added it.");
        await interaction.editReply("➕ Added <@&" + role.id + ">.");
        user.roles.add(role);
    }
}

async function addRoleRole(interaction, role, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var attackerRole = guild.roles.cache.find((role) => role.name === "Attacker");
    var defenderRole = guild.roles.cache.find((role) => role.name === "Defender");
    var hybridRole = guild.roles.cache.find((role) => role.name === "Hybrid");

    if (!role) {
        console.log("Couldn't get role.");
    }
    if (role === "attacker") {
        if (user.roles.cache.has(attackerRole.id)) {
            console.log("User had attacker role. Removed it.");
            await interaction.editReply("➖ Removed <@&" + attacker + ">.");
            user.roles.remove(attackerRole);
        } else {
            console.log("User didn't have attacker role. Added it.");
            await interaction.editReply("➕ Added <@&" + attacker + ">.");
            user.roles.add(attackerRole);
        }
    } else if (role === "defender") {
        if (user.roles.cache.has(defenderRole.id)) {
            console.log("User had defender role. Removed it.");
            await interaction.editReply("➖ Removed <@&" + defender + ">.");
            user.roles.remove(defenderRole);
        } else {
            console.log("User didn't have defender role. Added it.");
            await interaction.editReply("➕ Added <@&" + defender + ">.");
            user.roles.add(defenderRole);
        }
    } else if (role === "hybrid") {
        if (user.roles.cache.has(hybridRole.id)) {
            console.log("User had hybrid role. Removed it.");
            await interaction.editReply("➖ Removed <@&" + hybrid + ">.");
            user.roles.remove(hybridRole);
        } else {
            console.log("User didn't have hybrid role. Added it.");
            await interaction.editReply("➕ Added <@&" + hybrid + ">.");
            user.roles.add(hybridRole);
        }
    } else {
        console.log("Error. Role: " + role);
    }
}

async function addEventPing(interaction, guild, id) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "Event Ping");
    if (!role) {
        console.log("Couldn't get Event Ping role.");
    }
    if (user.roles.cache.has(role.id)) {
        logFile(id + " had Event Ping role. Removed it.");
        console.log("User had Event Ping role. Removed it.");
        await interaction.editReply("➖ Removed <@&" + eventPing + ">.");
        user.roles.remove(role);
    } else {
        logFile(id + " didn't have Event Ping role. Added it.");
        console.log("User didn't have Event Ping role. Added it.");
        await interaction.editReply("➕ Added <@&" + eventPing + ">.");
        user.roles.add(role);
    }
}

async function addRole(interaction, guild, id, color) {
    await interaction.deferReply({ ephemeral: true });
    var user = id;
    if (user === null) {
        console.log("User is null!");
        return;
    }
    var role = guild.roles.cache.find((role) => role.name === "Booster " + color);
    if (!role) {
        console.log("Couldn't get role Booster " + color + " role.");
        return;
    }
    //message.member.roles.cache.some(r => r.name === "Staff"))
    if (user.roles.cache.has(role.id)) {
        await interaction.editReply("➖ Removed <@&" + role.id + ">.");
        console.log("User had Booster " + color + " role. Removed it.");
        user.roles.remove(role);
    } else {
        console.log("User didn't have Booster " + color + " role. Added it.");
        await interaction.editReply("➕ Added <@&" + role.id + ">.");
        user.roles.add(role);
    }
}

// Creator channel
function creatorChannel(guild, id) {
    // Get the two users based on their ID.
    var user = guild.members.cache.get(id);

    if (support != 0) {
        support.push(support.length++);
    } else {
        // Otherwise, game[0] is equal to [0].
        support.push(0);
    }

    if (user.id === null || user === null) {
        console.log("User is null!");
        return;
    }

    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        let lowercase;
        if (rows.length < 1) {
            console.log("User doesn't exist!");
            lowercase = id;
            logFile(id + " created a creator ticket.");
        } else {
            logFile(rows[0].name + " created a creator ticket.");
            lowercase = rows[0].name.toLowerCase();
        }
        let title = "creator-" + lowercase;
        console.log(title);
        // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
        guild.channels.create(title, {
            permissionOverwrites: [
                {
                    id: guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"], //Deny permissions
                },
                {
                    // But allow the two users to view the channel, send messages, and read the message history.
                    id: user.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                },
                {
                    id: screensharer,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                },
                {
                    id: staff,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                },
            ],
        });
        // Move the users to that VC.
        setTimeout(function () {
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("close")
                    .setLabel("Close Ticket")
                    .setStyle("DANGER")
            );
            // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
            var channelID = guild.channels.cache.find((c) => c.name === title).id;
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(`Application for Creator or Partner`)
                .setDescription(
                    "Please fill out the following:\n ```1. Why you want to apply for creator/partner.\n 2. Benefits Ranked Bridge will get from partnering with you or giving you creator role.\n 3. What content you make (for creator) or type of server (for partner). 4. Link to your social media (for creator) or Discord (for partner).```"
                )
                .setTimestamp();
            // Send the embd.
            guild.channels.cache
                .get(channelID)
                .send({ components: [row], embeds: [errorEmbed] });
        }, 2000);
    });
}

// Screenshare channel
async function createScreenshareChannel(message, id, id2) {
    // Get the two users based on their ID.
    var user = message.guild.members.cache.get(id);

    con.query(`SELECT * FROM rbridge WHERE id = '${id2}'`, (err, rows) => {
        if (rows.length < 1) {
            console.log("User doesn't exist!");
            message.reply({ text: "That user doesn't exist!", ephemeral: true });
            return;
        }
        let lowercase = rows[0].name.toLowerCase();
        logFile(user.displayName + " is screensharing " + rows[0].name + ".");
        let title = "screenshare-" + lowercase;
        console.log(user.displayName + " is screensharing " + rows[0].name + ".");
        var user2 = client.users.fetch(id2).then((user2e) => {
            // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
            message.guild.channels.create(title, {
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"], //Deny permissions
                    },
                    {
                        // But allow the two users to view the channel, send messages, and read the message history.
                        id: user.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        // But allow the two users to view the channel, send messages, and read the message history.
                        id: user2e.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        id: screensharer,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        id: staff,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        id: jrScreensharer,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        id: srScreensharer,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                ],
            }).then((msg) => {
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(`Done`)
                    .setDescription(
                        "<#" + msg.id + ">"
                    )
                    .setTimestamp();
                message.reply({ embeds: [notSetEmbed], ephemeral: true });
                // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
                var channelID = msg.id;
                const errorEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(`Please fill out the following:`)
                    .setDescription(
                        "`1.` The user you want to screenshare.\n`2.` What hacks they might be using.\n`3.` Screenshot of you asking the user not to log.\n**Feel free to ping <@&" + screensharer + "> once you fill this out. Do NOT spam ping staff.**"
                    )
                    .setTimestamp();
                msg.send("<@&" + screensharer + ">")
                // Send the embd.
                msg.send({ embeds: [errorEmbed] });
            });

            message.guild.channels.create("SS " + rows[0].name, {
                type: "GUILD_VOICE",
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                        deny: ["VIEW_CHANNEL", "CONNECT", "SPEAK"], //Deny permissions
                    },
                    {
                        id: user2e.id,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    },
                    {
                        id: staff,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    },
                    {
                        id: jrScreensharer,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    },
                    {
                        id: screensharer,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    },
                    {
                        id: srScreensharer,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
                    },
                ],
            });
        }).catch((err) => message.reply({ text: "That user isn't in the server!", ephemeral: true }));
    });
}

// Get the UUID of the user from the Mojang API.
function getUUID(username, message) {
    let uuidURL = "https://api.mojang.com/users/profiles/minecraft/" + username;
    const file = new MessageAttachment("../container/caution_gif.gif");
    const notSetEmbed = new Discord.MessageEmbed()
        .setColor("#2f3136")
        .setTitle("`" + username + "` is not an actual player!")
        .setDescription(
            "If this is your account, use `=rename` to rename your account."
        )
        .setThumbnail("attachment://caution_gif.gif")
        .setTimestamp();
    // Send the embd.
    return fetch(uuidURL)
        .then((res) => res.json())
        .then((data) => data.id)
        .catch((error) => message.channel.send({ embeds: [notSetEmbed], files: [file] }));
}

// Get the username of the user from the Mojang API.
function getUsername(username, message) {
    let uuidURL = "https://api.mojang.com/users/profiles/minecraft/" + username;
    const file = new MessageAttachment("../container/caution_gif.gif");
    const notSetEmbed = new Discord.MessageEmbed()
        .setColor("#2f3136")
        .setTitle("`" + username + "` is not an actual player!")
        .setDescription(
            "If this is your account, use `=rename` to rename your account."
        )
        .setThumbnail("attachment://caution_gif.gif")
        .setTimestamp();
    return fetch(uuidURL)
        .then((res) => res.json())
        .then((data) => data.name)
        .catch((error) => message.channel.send({ embeds: [notSetEmbed], files: [file] }));
}

function getDuelsStats(name, message) {
    (async () => {
        let uuid = await getUUID(name, message);
        if (!uuid || uuid.id) {
            console.log("Returned successfully")
            return;
        }
    });
}

function getOnline(name, message, timezone) {
    (async () => {
        let uuid = await getUUID(name, message);
        if (!uuid || uuid.id) {
            console.log("Returned successfully")
            return;
        }
        const file = new MessageAttachment("../container/caution_gif.gif");
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("`" + name + "` is not an actual player!")
            .setDescription(
                "If this is your account, use `=rename` to rename your account."
            )
            .setThumbnail("attachment://caution_gif.gif")
            .setTimestamp();
        // Data is the UUID of the player from the JSON data.
        const data = await hypixel.player.uuid(uuid);
        if (!data) {
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        }
        let version = data.mcVersionRp;
        if (!version || version.includes("undefined")) {
            version = "Couldn't get version.";
        }
        let rank = data.newPackageRank;
        let plusCheck = data.monthlyPackageRank;
        if (rank === "MVP_PLUS") {
            rank = "MVP+";
        } else if (rank === "NONE") {
            rank = "Member";
        } else if (rank === "VIP_PLUS") {
            rank = "VIP+";
        } else if (!rank) {
            rank = "Member";
        }
        let lastLogin = data.lastLogin;
        let lastLogout = data.lastLogout;

        let timeLogout = Math.floor(new Date(lastLogout).getTime() / 1000.0);
        let isOnline = false;
        if (lastLogin > lastLogout) {
            isOnline = true;
        }
        let dateThing = new Date(lastLogin);
        try {
            let loginLast = dateThing.toLocaleString("en-US", { timeZone: timezone });
            let username = await getUsername(name, message);
            if (!username) {
                return;
            }

            timeLogout = timeLogout / 1000;
            if (timeLogout >= 60 && timeLogout < 3600) {
                timeLogout = (timeLogout / 60) + " minutes.";
            } else if (timeLogout >= 3600 && timeLogout < 86400) {
                timeLogout = (timeLogout / 3600) + " hours.";
            } else if (timeLogout >= 86400) {
                timeLogout = (timeLogout / 86400) + " days.";
            } else {
                timeLogout = timeLogout + " seconds.";
            }
            message.channel.send("Time since last logout: " + timeLogout);
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(username + `'s Last Login:`)
                .setDescription(
                    "`Version:` **" + version + "**\n`Rank:` **" + rank + "**\n`Online:` **" + isOnline + "**\n`Last Login:` **" + loginLast + "**"
                )
                .setThumbnail("https://mc-heads.net/avatar/" + uuid)
                .setTimestamp();
            message.channel.send({ embeds: [errorEmbed] });
        } catch (err) {
            let loginLast = dateThing.toLocaleString("en-US", { timeZone: "PST" });
            let username = await getUsername(name, message);
            if (!username) {
                return;
            }
            const errorEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(username + `'s Last Login:`)
                .setDescription(
                    "`Version:` **" + version + "**\n`Rank:` **" + rank + "**\n`Online:` **" + isOnline + "**\n`Last Login:` **" + loginLast + "**"
                )
                .setThumbnail("https://mc-heads.net/avatar/" + uuid)
                .setTimestamp();
            message.channel.send({ embeds: [errorEmbed] });
            //message.channel.send("Time since logout: " + timeLogout);
        }
    })();
}

// Get the Discord tag of the user from Hypixel API.
function getDiscord(uuid, message, name) {
    (async () => {
        // Data is the UUID of the player from the JSON data.
        const data = await hypixel.player.uuid(uuid);
        // If the Discord tag is invalid or undefined...
        if (
            data.socialMedia === undefined ||
            data.socialMedia.links === undefined ||
            data.socialMedia.links.DISCORD === undefined
        ) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(name + " hasn't linked their Discord!")
                .setDescription(
                    "If this is your account, follow the steps shown on the gif."
                )
                .setThumbnail("attachment://caution_gif.gif")
                .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
                .setTimestamp();
            // Send the embd.
            return message.channel.send({ embeds: [notSetEmbed], files: [file] });
        } else {
            // x is the Discord tag.
            var x = data.socialMedia.links.DISCORD;

            // If x is not undefined...
            if (typeof x != "undefined") {
                // If the tag DOES NOT match the current user's tag...
                if (message.member.user.tag != x) {
                    // Create a new embed.
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + "'s Discord is linked to " + x + "!")
                        .setDescription(
                            "If this is your account, please change your Discord tag on Hypixel to `" +
                            message.member.user.tag +
                            "`."
                        )
                        .setThumbnail("attachment://caution_gif.gif")
                        .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.channel.send({ embeds: [notSetEmbed], files: [file] });
                } else if (!message.guild.me.permissions.has("MANAGE_NICKNAMES")) {
                    // Doesn't usually work, but never had an issue with this unless the owner of the server tries to register.
                    return message.channel.send(
                        "I don't have permission to change your nickname!"
                    );
                } else {
                    // Add the "Ranked Player" role, remove the "Unranked" role, and set the user's nickname.
                    var role = message.member.guild.roles.cache.find(
                        (role) => role.id === rankedPlayer
                    );
                    var coalDiv = coalDivision;
                    message.member.roles.add(role);
                    message.member.roles.add(role);
                    message.member.roles.add(coalDiv);
                    message.member.roles.add(coalDiv);
                    console.log("Added the role to the user.");
                    message.member.roles.remove(unverified);

                    message.member.setNickname("[1000] " + name);
                    message.member.setNickname("[1000] " + name);

                    // Insert the user into the database.
                    insertUser(message, message.member.id, name);
                }
            } else {
                // User's Discord is not set.
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " hasn't linked their Discord!")
                    .setDescription(
                        "If this is your account, follow the steps shown on the gif."
                    )
                    .setThumbnail("attachment://caution_gif.gif")
                    .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [file] });
            }
        }
    })();
}

// View above. Essentially the same thing as getDiscord().
// Checks to see if all the data matches, then updates the user's username in the database.
function rename(uuid, message, name) {
    (async () => {
        const data = await hypixel.player.uuid(uuid);
        if (data.socialMedia === undefined) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(name + " hasn't linked their Discord!")
                .setDescription(
                    "If this is your account, follow the steps shown on the gif."
                )
                .setThumbnail("attachment://caution_gif.gif")
                .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
                .setTimestamp();
            // Send the embd.
            return message.channel.send({ embeds: [notSetEmbed], files: [file] });
        } else {
            var x = data.socialMedia.links.DISCORD;

            if (typeof x != "undefined") {
                if (message.member.user.tag != x) {
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + "'s Discord is linked to " + x + "!")
                        .setDescription(
                            "If this is your account, please change your Discord tag on Hypixel to `" +
                            message.member.user.tag +
                            "`."
                        )
                        .setThumbnail("attachment://caution_gif.gif")
                        .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.channel.send({ embeds: [notSetEmbed], files: [file] });
                } else if (!message.guild.me.permissions.has("MANAGE_NICKNAMES")) {
                    return message.channel.send(
                        "I don't have permission to change your nickname!"
                    );
                } else {
                    // Update the user.
                    con.query(
                        `SELECT * FROM rbridge WHERE id = ?`,
                        [message.member.user.id],
                        function (err, rows, fields) {
                            if (err) throw err;

                            let sql;

                            if (rows.length < 1) {
                                // Create a new embed.
                                const file = new MessageAttachment(
                                    "../container/caution_gif.gif"
                                );
                                const notSetEmbed = new Discord.MessageEmbed()
                                    .setColor("#2f3136")
                                    .setTitle("You're not registered!")
                                    .setDescription(
                                        "Please re-register in <#" + registerChannel + ">."
                                    )
                                    .setThumbnail("attachment://caution_gif.gif")
                                    .setTimestamp();
                                // Send the embd.
                                message.channel.send({ embeds: [notSetEmbed], files: [file] });
                                return;
                            } else {
                                sql = `UPDATE rbridge SET name = '${name}' WHERE id='${message.member.id}'`;
                                let p1 = rows[0].elo;
                                message.member.setNickname("[" + p1 + "] " + name);
                                con.query(sql);
                            }
                        }
                    );
                    // Create a new embed.
                    const registeredEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Renamed as " + name + ".")
                        .setTimestamp();
                    // Send the embd.
                    message.channel.send({ embeds: [registeredEmbed] });
                    logFile(message.author.tag + " renamed themselves as " + name + ".");
                }
            } else {
                const file = new MessageAttachment("../container/caution_gif.gif");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " hasn't linked their Discord!")
                    .setDescription(
                        "If this is your account, follow the steps shown on the gif."
                    )
                    .setThumbnail("attachment://caution_gif.gif")
                    .setImage("https://media.giphy.com/media/GkBJtdg7avYshmfcFi/giphy.gif")
                    .setTimestamp();
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed], files: [file] });
            }
        }
    })();
}

function scoreEloI(interaction, id, elo) {
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            var coalDiv = interaction.guild.roles.fetch(coalDivision).then((coal) => {
                var ironDiv = interaction.guild.roles.fetch(ironDivision).then((iron) => {
                    var goldDiv = interaction.guild.roles.fetch(goldDivision).then((gold) => {
                        var diamondDiv = interaction.guild.roles.fetch(diamondDivision).then((diamond) => {
                            var obsidianDiv = interaction.guild.roles.fetch(obsidianDivision).then((obsidian) => {
                                var emeraldDiv = interaction.guild.roles.fetch(emeraldDivision).then((emerald) => {
                                    var crystalDiv = interaction.guild.roles.fetch(crystalDivision).then((crystal) => {
                                        var asdf = interaction.guild.members.fetch(id).then((user) => {
                                            if (!user || !user.roles) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                                return;
                                            }
                                            if (elo <= 999) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                                user.roles.remove(ironDivision);
                                                user.roles.add(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1100 && elo >= 1000) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "IRON" WHERE id='${id}'`;
                                                user.roles.add(iron);
                                                user.roles.remove(coalDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1200 && elo >= 1100) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "GOLD" WHERE id='${id}'`;
                                                user.roles.add(gold);
                                                user.roles.remove(iron);
                                                user.roles.remove(diamond);
                                                user.roles.remove(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1400 && elo >= 1200) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "DIAMOND" WHERE id='${id}'`;
                                                user.roles.add(diamond);
                                                user.roles.remove(goldDivision);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1600 && elo >= 1400) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "EMERALD" WHERE id='${id}'`;
                                                user.roles.add(emerald);
                                                user.roles.remove(diamondDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1800 && elo >= 1600) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "OBSIDIAN" WHERE id='${id}'`;
                                                user.roles.add(obsidian);
                                                user.roles.remove(diamondDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo >= 1800) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "CRYSTAL" WHERE id='${id}'`;
                                                user.roles.add(crystal);
                                                user.roles.remove(diamondDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(emerald);
                                            } else if (elo < 1000) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                                user.roles.remove(ironDivision);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.add(coal);
                                                user.roles.remove(crystal);
                                            } else {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                            }
                                            con.query(sql);
                                        }).catch((e) => console.error(e));
                                    }).catch((err) => console.error(err));;
                                }).catch((err) => console.error(err));;
                            }).catch((err) => console.error(err));;
                        }).catch((err) => console.error(err));;
                    }).catch((err) => console.error(err));;
                }).catch((err) => console.error(err));;
            }).catch((err) => console.error(err));;
        }
    });
}

// Score the game. Update the table.
function scoreElo(message, id, elo) {
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            var coalDiv = message.guild.roles.fetch(coalDivision).then((coal) => {
                var ironDiv = message.guild.roles.fetch(ironDivision).then((iron) => {
                    var goldDiv = message.guild.roles.fetch(goldDivision).then((gold) => {
                        var diamondDiv = message.guild.roles.fetch(diamondDivision).then((diamond) => {
                            var obsidianDiv = message.guild.roles.fetch(obsidianDivision).then((obsidian) => {
                                var emeraldDiv = message.guild.roles.fetch(emeraldDivision).then((emerald) => {
                                    var crystalDiv = message.guild.roles.fetch(crystalDivision).then((crystal) => {
                                        var asdf = message.guild.members.fetch(id).then((user) => {
                                            if (!user || !user.roles) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                                return;
                                            }
                                            if (elo <= 999) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                                user.roles.remove(ironDivision);
                                                user.roles.add(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1100 && elo >= 1000) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "IRON" WHERE id='${id}'`;
                                                user.roles.add(iron);
                                                user.roles.remove(coalDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1200 && elo >= 1100) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "GOLD" WHERE id='${id}'`;
                                                user.roles.add(gold);
                                                user.roles.remove(iron);
                                                user.roles.remove(diamond);
                                                user.roles.remove(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1400 && elo >= 1200) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "DIAMOND" WHERE id='${id}'`;
                                                user.roles.add(diamond);
                                                user.roles.remove(goldDivision);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1600 && elo >= 1400) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "EMERALD" WHERE id='${id}'`;
                                                user.roles.add(emerald);
                                                user.roles.remove(diamondDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(crystal);
                                            } else if (elo < 1800 && elo >= 1600) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "OBSIDIAN" WHERE id='${id}'`;
                                                user.roles.add(obsidian);
                                                user.roles.remove(diamondDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(emerald);
                                                user.roles.remove(crystal);
                                            } else if (elo >= 1800) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "CRYSTAL" WHERE id='${id}'`;
                                                user.roles.add(crystal);
                                                user.roles.remove(diamondDivision);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.remove(coal);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(emerald);
                                            } else if (elo < 1000) {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                                user.roles.remove(ironDivision);
                                                user.roles.remove(obsidian);
                                                user.roles.remove(diamond);
                                                user.roles.remove(gold);
                                                user.roles.add(coal);
                                                user.roles.remove(crystal);
                                            } else {
                                                sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
                                            }
                                            con.query(sql);
                                        }).catch((err) => console.error(err));;
                                    }).catch((err) => console.error(err));;
                                }).catch((err) => console.error(err));;
                            }).catch((err) => console.error(err));;
                        }).catch((err) => console.error(err));;
                    }).catch((err) => console.error(err));;
                }).catch((err) => console.error(err));;
            }).catch((err) => console.error(err));;
        }
    });
}

function setElo(message, name, elo) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Couldn't find `" + name + "` in the database!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            sql = `UPDATE rbridge SET elo = ${elo} WHERE name='${name}'`;
            scoreElo(message, rows[0].id, elo);
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Set " + name + "'s ELO to " + elo + ".")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            logFile("Set " + name + "'s ELO to " + elo + ".");
        }
    });
}

function setWins(message, name, wins) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Couldn't find `" + name + "` in the database!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            sql = `UPDATE rbridge SET wins = ${wins} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Set " + name + "'s wins to " + wins + ".")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            logFile("Set " + name + "'s wins to " + wins + ".");
        }
    });
}

function setLosses(message, name, losses) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Couldn't find `" + name + "` in the database!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            sql = `UPDATE rbridge SET losses = ${losses} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Set " + name + "'s losses to " + losses + ".")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            logFile("Set " + name + "'s losses to " + losses + ".");
        }
    });
}

function setWinstreak(message, name, winstreak) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Couldn't find `" + name + "` in the database!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            sql = `UPDATE rbridge SET winstreak = ${winstreak} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Set " + name + "'s winstreak to " + winstreak + ".")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            logFile("Set " + name + "'s winstreak to " + winstreak + ".");
        }
    });
}

function setGames(message, name, games) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Couldn't find `" + name + "` in the database!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            sql = `UPDATE rbridge SET games = ${games} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Set " + name + "'s games to " + games + ".")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            logFile("Set " + name + "'s games to " + games + ".");
        }
    });
}

async function strike(interaction, name, reason) {

    con.query(`SELECT * FROM punishments WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, async (err, rowes) => {
            if (rowes.length < 1) {
                interaction.reply("Can't find `" + name + "` in the main database.");
                return;
            }
            if (rows.length < 1) {
                console.log("User doesn't exist in punishments table. Inserting them...");
                con.query(`INSERT INTO punishments (name, strikes) VALUES ('${name}', 0)`, async (erre, rowees) => {
                    if (erre) throw erre;
                    con.query(`UPDATE punishments SET strikes = 1 WHERE name='${name}'`, async (erress, roweees) => {
                        if (erress) throw erress;
                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(name + " recieved a strike.")
                            .setDescription("Current strikes: `1`\nReason:`" + reason + "`")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [helpEmbed] });
                        var asdf = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                            if (!user || !user.roles) {
                                console.log("Couldn't get user.");
                                interaction.reply("Couldn't get that user.");
                                return;
                            }
                            user.roles.add(strikeOne);
                            user.roles.remove(strikeTwo);
                            user.roles.remove(strikeThree);
                            user.roles.remove(strikeFour);
                            user.roles.remove(strikeFive);
                        }).catch((err) => console.error(err));
                        interaction.guild.channels.cache.get(punishmentsChannel).send({ embeds: [helpEmbed] });
                        logFile("Striked " + name + " (first strike).");
                    });
                });
                return;
            } else if (rowes.length < 1) {
                interaction.reply("That user doesn't exist in the main database!");
            } else {
                let strikes = parseInt(rows[0].strikes);
                if (strikes >= 4) {
                    console.log(name + "'s strikes are greater or equal to 5. Strikes: " + strikes + ".");
                    let testStrike = strikes += 1;
                    var asdf = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                        if (!user || !user.roles) {
                            console.log("Couldn't get user.");
                            interaction.reply("Couldn't get that user.");
                            return;
                        }
                        user.roles.add(strikeFive);
                        user.roles.remove(strikeTwo);
                        user.roles.remove(strikeThree);
                        user.roles.remove(strikeFour);
                        user.roles.remove(strikeOne);
                    }).catch((err) => console.error(err));;
                    console.log("Test strike: " + testStrike);
                    con.query(`UPDATE punishments SET strikes = ${(testStrike)} WHERE name='${name}'`, async (erre, rowees) => {
                        if (erre) throw erre;

                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(name + " recieved a strike.")
                            .setDescription("Current strikes: `" + testStrike + "`\nReason:`" + reason + "`")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [helpEmbed] });
                        interaction.channel.send("User has 4+ strikes. I'd ban them.");
                        interaction.guild.channels.cache
                            .get(punishmentsChannel)
                            .send({ embeds: [helpEmbed] });
                        logFile("Striked " + name + " (first strike).");
                    });

                    logFile(rows[0].name + " was struck (" + testStrike + " strikes).");
                    return;
                } else {
                    console.log(name + "'s strikes are less than 5. Strikes: " + strikes + ".");
                    let testStrike = strikes += 1;
                    console.log("Test strike: " + testStrike);
                    con.query(`UPDATE punishments SET strikes = ${(testStrike)} WHERE name='${name}'`, async (erre, rowees) => {
                        if (erre) throw erre;

                        var asdf = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                            if (!user || !user.roles) {
                                console.log("Couldn't get user.");
                                interaction.reply("Couldn't get that user.");
                                return;
                            }
                            if (testStrike === 2) {
                                user.roles.add(strikeTwo);
                                user.roles.remove(strikeOne);
                                user.roles.remove(strikeThree);
                                user.roles.remove(strikeFour);
                                user.roles.remove(strikeFive);
                            } else if (testStrike === 3) {
                                user.roles.add(strikeThree);
                                user.roles.remove(strikeTwo);
                                user.roles.remove(strikeOne);
                                user.roles.remove(strikeFour);
                                user.roles.remove(strikeFive);
                            } else if (testStrike === 4) {
                                user.roles.add(strikeFour);
                                user.roles.remove(strikeTwo);
                                user.roles.remove(strikeThree);
                                user.roles.remove(strikeOne);
                                user.roles.remove(strikeFive);
                            }
                        }).catch((err) => console.error(err));;
                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(name + " recieved a strike.")
                            .setDescription("Current strikes: `" + testStrike + "`\nReason:`" + reason + "`")
                            .setTimestamp();
                        // Send the embd.
                        interaction.reply({ embeds: [helpEmbed] });
                        interaction.guild.channels.cache
                            .get(punishmentsChannel)
                            .send({ embeds: [helpEmbed] });
                        logFile("Striked " + name + " (first strike).");
                    });
                    logFile(rows[0].name + " was struck (" + testStrike + " strikes).");
                }
            }
        });
    });
}

async function strikeMessage(interaction, name, reason) {

    con.query(`SELECT * FROM punishments WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, async (err, rowes) => {
            if (rowes.length < 1) {
                interaction.channel.send("Can't find `" + name + "` in the main database.");
                return;
            }
            if (rows.length < 1) {
                console.log("User doesn't exist in punishments table. Inserting them...");
                con.query(`INSERT INTO punishments (name, strikes) VALUES ('${name}', 0)`, async (erre, rowees) => {
                    if (erre) throw erre;
                    con.query(`UPDATE punishments SET strikes = 1 WHERE name='${name}'`, async (erress, roweees) => {
                        if (erress) throw erress;
                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(name + " recieved a strike.")
                            .setDescription("Current strikes: `1`\nReason:`" + reason + "`")
                            .setTimestamp();
                        // Send the embd.
                        interaction.channel.send({ embeds: [helpEmbed] });
                        var asdf = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                            if (!user || !user.roles) {
                                console.log("Couldn't get user.");
                                interaction.channel.send("Couldn't get that user.");
                                return;
                            }
                            user.roles.add(strikeOne);
                            user.roles.remove(strikeTwo);
                            user.roles.remove(strikeThree);
                            user.roles.remove(strikeFour);
                            user.roles.remove(strikeFive);
                        });
                        interaction.guild.channels.cache
                            .get(punishmentsChannel)
                            .send({ embeds: [helpEmbed] });
                        logFile("Striked " + name + " (first strike).");
                    });
                });
                return;
            } else if (rowes.length < 1) {
                interaction.channel.send("That user doesn't exist in the main database!");
            } else {
                let strikes = parseInt(rows[0].strikes);
                if (strikes >= 4) {
                    console.log(name + "'s strikes are greater or equal to 5. Strikes: " + strikes + ".");
                    let testStrike = strikes += 1;
                    var asdf = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                        if (!user || !user.roles) {
                            console.log("Couldn't get user.");
                            interaction.channel.send("Couldn't get that user.");
                            return;
                        }
                        user.roles.add(strikeFive);
                        user.roles.remove(strikeTwo);
                        user.roles.remove(strikeThree);
                        user.roles.remove(strikeFour);
                        user.roles.remove(strikeOne);
                    }).catch((err) => console.error(err));;
                    console.log("Test strike: " + testStrike);
                    con.query(`UPDATE punishments SET strikes = ${(testStrike)} WHERE name='${name}'`, async (erre, rowees) => {
                        if (erre) throw erre;

                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(name + " recieved a strike.")
                            .setDescription("Current strikes: `" + testStrike + "`\nReason:`" + reason + "`")
                            .setTimestamp();
                        // Send the embd.
                        interaction.channel.send({ embeds: [helpEmbed] });
                        interaction.channel.send("User has 4+ strikes. I'd ban them.");
                        interaction.guild.channels.cache
                            .get(punishmentsChannel)
                            .send({ embeds: [helpEmbed] });
                        logFile("Striked " + name + " (first strike).");
                    });

                    logFile(rows[0].name + " was struck (" + testStrike + " strikes).");
                    return;
                } else {
                    console.log(name + "'s strikes are less than 5. Strikes: " + strikes + ".");
                    let testStrike = strikes += 1;
                    console.log("Test strike: " + testStrike);
                    con.query(`UPDATE punishments SET strikes = ${(testStrike)} WHERE name='${name}'`, async (erre, rowees) => {
                        if (erre) throw erre;

                        var asdf = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                            if (!user || !user.roles) {
                                console.log("Couldn't get user.");
                                interaction.channel.send("Couldn't get that user.");
                                return;
                            }
                            if (testStrike === 2) {
                                user.roles.add(strikeTwo);
                                user.roles.remove(strikeOne);
                                user.roles.remove(strikeThree);
                                user.roles.remove(strikeFour);
                                user.roles.remove(strikeFive);
                            } else if (testStrike === 3) {
                                user.roles.add(strikeThree);
                                user.roles.remove(strikeTwo);
                                user.roles.remove(strikeOne);
                                user.roles.remove(strikeFour);
                                user.roles.remove(strikeFive);
                            } else if (testStrike === 4) {
                                user.roles.add(strikeFour);
                                user.roles.remove(strikeTwo);
                                user.roles.remove(strikeThree);
                                user.roles.remove(strikeOne);
                                user.roles.remove(strikeFive);
                            }
                        }).catch((err) => console.error(err));;
                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor("#2f3136")
                            .setTitle(name + " recieved a strike.")
                            .setDescription("Current strikes: `" + testStrike + "`\nReason:`" + reason + "`")
                            .setTimestamp();
                        // Send the embd.
                        interaction.channel.send({ embeds: [helpEmbed] });
                        interaction.guild.channels.cache
                            .get(punishmentsChannel)
                            .send({ embeds: [helpEmbed] });
                        logFile("Striked " + name + " (first strike).");
                    });
                    logFile(rows[0].name + " was struck (" + testStrike + " strikes).");
                }
            }
        });
    });
}

function banUser(interaction, name, time, timeFormat, reason) {
    var role = interaction.guild.roles.cache.find(
        (role) => role.id === banned
    );
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
        if (rowes.length < 1) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Couldn't find `" + name + "` in the database!")
                .setDescription("For now, don't use mentions. Will hopefully be fixed.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            interaction.reply({ embeds: [notSetEmbed], files: [file] });
            return;
        } else {
            var mention = interaction.guild.members.cache.get(rowes[0].id);
            logFile(rowes[0].name + " is banned for " + time + " " + timeFormat + ".");
            let numTime = time;
            if (timeFormat != undefined && typeof timeFormat != "undefined") {
                if (timeFormat === "Days") {
                    let currentTime = Date.now() + numTime * 86400000;
                    con.query(`SELECT * FROM banned WHERE name = '${name}'`, (err, rowess) => {
                        if (!rowess.length < 1) {
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        } else {
                            sql = `DELETE FROM banned WHERE name = ${name}`;
                            con.query(sql);
                            console.log("Deleted " + name + " from banned table.");
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        }
                    });

                    if (mention != undefined) {
                        mention.roles.add(role);
                        mention.roles.remove(rankedPlayer);
                    }
                    const embedCool = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    interaction.reply({ embeds: [embedCool] });
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    // Send the embed.
                    interaction.guild.channels.cache.get(bansChannel).send({ embeds: [notSetEmbed] });
                } else if (timeFormat === "Minutes") {
                    let currentTime = Date.now() + numTime * 60000;
                    con.query(`SELECT * FROM banned WHERE name = '${name}'`, (err, rowess) => {
                        if (!rowess.length < 1) {
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        } else {
                            sql = `DELETE FROM banned WHERE name = ${name}`;
                            con.query(sql);
                            console.log("Deleted " + name + " from banned table.");
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        }
                    });

                    if (mention != undefined) {
                        mention.roles.add(role);
                        mention.roles.remove(rankedPlayer);
                    }
                    const embedCool = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    interaction.reply({ embeds: [embedCool] });
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    // Send the embed.
                    interaction.guild.channels.cache
                        .get(bansChannel)
                        .send({ embeds: [notSetEmbed] });
                } else if (timeFormat === "Seconds") {
                    let currentTime = Date.now() + numTime * 1000;
                    con.query(`SELECT * FROM banned WHERE name = '${name}'`, (err, rowess) => {
                        if (!rowess.length < 1) {
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        } else {
                            sql = `DELETE FROM banned WHERE name = ${name}`;
                            con.query(sql);
                            console.log("Deleted " + name + " from banned table.");
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        }
                    });

                    if (mention != undefined) {
                        mention.roles.add(role);
                        mention.roles.remove(rankedPlayer);
                    }
                    const embedCool = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    interaction.reply({ embeds: [embedCool] });
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    // Send the embed.
                    interaction.guild.channels.cache
                        .get(bansChannel)
                        .send({ embeds: [notSetEmbed] });
                } else if (timeFormat === "Hours") {
                    let currentTime = Date.now() + numTime * 3600000;
                    con.query(`SELECT * FROM banned WHERE name = '${name}'`, (err, rowess) => {
                        if (!rowess.length < 1) {
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        } else {
                            sql = `DELETE FROM banned WHERE name = ${name}`;
                            con.query(sql);
                            console.log("Deleted " + name + " from banned table.");
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        }
                    });

                    if (mention != undefined) {
                        mention.roles.add(role);
                        mention.roles.remove(rankedPlayer);
                    }
                    const embedCool = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    interaction.reply({ embeds: [embedCool] });
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `" + time + " " + timeFormat + "`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    // Send the embed.
                    interaction.guild.channels.cache
                        .get(bansChannel)
                        .send({ embeds: [notSetEmbed] });
                } else if (timeFormat === "Permanent") {
                    let currentTime = Date.now() + 111000000000;
                    con.query(`SELECT * FROM banned WHERE name = '${name}'`, (err, rowess) => {
                        if (!rowess.length < 1) {
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        } else {
                            sql = `DELETE FROM banned WHERE name = ${name}`;
                            con.query(sql);
                            console.log("Deleted " + name + " from banned table.");
                            sql = `INSERT INTO banned (id, name, time) VALUES ('${rowes[0].id}', '${name}', '${currentTime}')`;
                            con.query(sql);
                            console.log("Inserted " + name + " into ban table.");
                        }
                    });

                    if (mention != undefined) {
                        mention.roles.add(role);
                        mention.roles.remove(rankedPlayer);
                    }
                    const embedCool = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `Permanent`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    interaction.reply({ embeds: [embedCool] });
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(name + " recieved a ban")
                        .setDescription("User: <@" + rowes[0].id + ">\nTime: `Permanent`.\nReason: ```" + reason + "```")
                        .setTimestamp();
                    // Send the embed.
                    interaction.guild.channels.cache
                        .get(bansChannel)
                        .send({ embeds: [notSetEmbed] });
                } else {
                    const file = new MessageAttachment(
                        "../container/caution_gif.gif"
                    );
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Please provide a valid time!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    interaction.reply({ embeds: [notSetEmbed], files: [file] });
                }
            }
        }
    });
}

async function muteUser(interaction, user, time, timeFormat, reason) {
    var role = interaction.guild.roles.cache.find(
        (role) => role.id === muted
    );
    let mention = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!mention) {
        interaction.reply("Can't get that user. Maybe they left?");
        return;
    }
    let name = user.username;
    // If there isn't an user mentioned...
    if (!mention) {
        const file = new MessageAttachment("../container/caution_gif.gif");
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("Please provide a valid user! Maybe they left?")
            .setThumbnail("attachment://caution_gif.gif")
            .setTimestamp();
        // Send the embd.
        interaction.reply({ embeds: [notSetEmbed], files: [file] });
        return;
    } else {
        logFile(user.username + " is muted for " + time + " " + timeFormat);
        let numTime = time;
        if (timeFormat != undefined && typeof timeFormat != "undefined") {
            if (timeFormat === "Days") {
                mention.roles.add(role);
                let currentTime = Date.now() + numTime * 86400000;

                const embedCool = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                interaction.reply({ embeds: [embedCool] });
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                con.query(`SELECT * FROM muted WHERE id = '${user.id}'`, (err, rowess) => {
                    if (!rowess.length < 1) {
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into muted table.");
                    } else {
                        sql = `DELETE FROM muted WHERE id = ${user.id}`;
                        con.query(sql);
                        console.log("Deleted " + name + " from banned table.");
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${name}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into ban table.");
                    }
                });
                // Send the embed.
                interaction.guild.channels.cache
                    .get(punishmentsChannel)
                    .send({ embeds: [notSetEmbed] });
            } else if (timeFormat === "Minutes") {
                let currentTime = Date.now() + numTime * 60000;
                mention.roles.add(role);
                const embedCool = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                interaction.reply({ embeds: [embedCool] });
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();

                con.query(`SELECT * FROM muted WHERE id = '${user.id}'`, (err, rowess) => {
                    if (!rowess.length < 1) {
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into muted table.");
                    } else {
                        sql = `DELETE FROM muted WHERE id = ${user.id}`;
                        con.query(sql);
                        console.log("Deleted " + name + " from banned table.");
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${name}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into ban table.");
                    }
                });
                // Send the embed.
                interaction.guild.channels.cache
                    .get(punishmentsChannel)
                    .send({ embeds: [notSetEmbed] });
            } else if (timeFormat === "Seconds") {
                let currentTime = Date.now() + numTime * 1000;
                con.query(`SELECT * FROM muted WHERE id = '${user.id}'`, (err, rowess) => {
                    if (!rowess.length < 1) {
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into muted table.");
                    } else {
                        sql = `DELETE FROM muted WHERE id = ${user.id}`;
                        con.query(sql);
                        console.log("Deleted " + name + " from banned table.");
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${name}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into ban table.");
                    }
                });

                mention.roles.add(role);
                const embedCool = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                interaction.reply({ embeds: [embedCool] });
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                // Send the embed.
                interaction.guild.channels.cache
                    .get(punishmentsChannel)
                    .send({ embeds: [notSetEmbed] });
            } else if (timeFormat === "Hours") {
                let currentTime = Date.now() + numTime * 3600000;
                con.query(`SELECT * FROM muted WHERE id = '${user.id}'`, (err, rowess) => {
                    if (!rowess.length < 1) {
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into muted table.");
                    } else {
                        sql = `DELETE FROM muted WHERE id = ${user.id}`;
                        con.query(sql);
                        console.log("Deleted " + name + " from banned table.");
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${name}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into ban table.");
                    }
                });

                mention.roles.add(role);
                const embedCool = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                interaction.reply({ embeds: [embedCool] });
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `" + time + " " + timeFormat + "`\nReason: ```" + reason + "```")
                    .setTimestamp();
                // Send the embed.
                interaction.guild.channels.cache.get(punishmentsChannel)
                    .send({ embeds: [notSetEmbed] });
            } else if (timeFormat === "Permanent") {
                let currentTime = Date.now() + 111000000000;
                con.query(`SELECT * FROM muted WHERE id = '${user.id}'`, (err, rowess) => {
                    if (!rowess.length < 1) {
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into muted table.");
                    } else {
                        sql = `DELETE FROM muted WHERE id = ${user.id}`;
                        con.query(sql);
                        console.log("Deleted " + name + " from banned table.");
                        sql = `INSERT INTO muted (id, name, time) VALUES ('${user.id}', '${name}', '${currentTime}')`;
                        con.query(sql);
                        console.log("Inserted " + name + " into ban table.");
                    }
                });

                mention.roles.add(role);
                const embedCool = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `Permanent`\nReason: ```" + reason + "```")
                    .setTimestamp();
                interaction.reply({ embeds: [embedCool] });
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(name + " recieved a mute.")
                    .setDescription("User: <@" + user.id + ">\nTime: `Permanent`\nReason: ```" + reason + "```")
                    .setTimestamp();
                // Send the embed.
                interaction.guild.channels.cache.get(punishmentsChannel)
                    .send({ embeds: [notSetEmbed] });
            } else {
                const file = new MessageAttachment(
                    "../container/caution_gif.gif"
                );
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Please provide a valid time!")
                    .setThumbnail("attachment://caution_gif.gif")
                    .setTimestamp();
                // Send the embd.
                interaction.reply({ embeds: [notSetEmbed], files: [file] });
            }
        } else {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Please provide a valid time!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            interaction.reply({ embeds: [notSetEmbed], files: [file] });
        }
    }
}

function unbanUser(interaction, name, reason) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
        if (rowes.length < 1) {
            return;
        } else {
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle(rowes[0].name + " is now unbanned.")
                .setTimestamp();
            var user1 = interaction.guild.members.fetch(rowes[0].id).then((user) => {
                logFile(rowes[0].name + " is unbanned.");
                con.query(`DELETE FROM banned WHERE id = '${rowes[0].id}'`, (erre, row) => {
                    if (erre) throw erre;
                });
                user.roles.remove(banned);
                var role = interaction.guild.roles.cache.find(
                    (role) => role.name === "Unverified"
                );
                user.roles.add(role);
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle(rowes[0].name + " is now unbanned.")
                    .setDescription('`' + reason + '`')
                    .setTimestamp();
                // Send the embed.
                interaction.guild.channels.cache.get(bansChannel).send({ embeds: [notSetEmbed] });
                return;
            }).catch((e) => {
                con.query(`DELETE FROM banned WHERE id = '${rowes[0].id}'`, (erre, row) => {
                    if (erre) throw erre;
                });
                interaction.guild.channels.cache.get(bansChannel).send({ embeds: [notSetEmbed] })
            });
        }
    });
}

// Insert the user into the database.
function insertUser(message, id, name) {
    // The "Ranked Player" role (I think)
    var role = message.guild.roles.cache.find(
        (role) => role.id === rankedPlayer
    );
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowse) => {
                if (rowse.length < 1) {
                    sql = `INSERT INTO rbridge (id, elo, name) VALUES ('${id}', '1000', '${name}')`;
                    console.log("Inserting " + id + "...");
                    con.query(sql);
                    // Create a new embed.
                    const registeredEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Registered as " + name + ".")
                        .setTimestamp();
                    // Send the embed.
                    message.channel.send({ embeds: [registeredEmbed] });
                    message.member.setNickname("[1000] " + name);
                    playersE++;
                    logFile(name + " is now registered.");
                } else {
                    sql = `UPDATE rbridge SET id='${id}' WHERE name='${name}'`;
                    console.log("Updating " + id + "...");
                    con.query(sql);
                    // Create a new embed.
                    const registeredEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Registered as " + name + ".")
                        .setTimestamp();
                    // Send the embed.
                    message.channel.send({ embeds: [registeredEmbed] });
                    message.member.setNickname("[1000] " + name);
                    playersE++;
                    logFile(name + " is now registered.");
                }
            });
        } else {
            // Add the role and set the nickname.
            message.member.roles.add(role);
            message.member.roles.remove(unverified);
            message.member.setNickname("[" + rows[0].elo + "] " + name);
            sql = `UPDATE rbridge SET name='${name}' WHERE id='${id}'`;
            con.query(sql);
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Welcome back " + name + "!")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
            logFile(name + " re-registered");
        }
    });
}

// Set the user's nickname based on their ELO.
function setName(interaction, id, elo) {
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            console.log("Couldn't get user " + id + ".");
            return;
        }

        interaction.guild.members
            .fetch(id)
            .then((member) => {
                let nick = member.displayName;
                if (nick.includes("[") && !nick.includes("(")) {
                    interaction.guild.members.fetch(id).then((user) => user.setNickname("[" + elo + "] " + rows[0].name)).catch((err) => console.error(err));;
                } else if (nick.includes("[") && nick.includes("(")) {
                    let split = nick.split(" ");
                    let restNick = split[1] + " " + split[2];
                    interaction.guild.members.fetch(id).then((user) => user.setNickname("[" + elo + "] " + restNick).catch((e) => console.log("Error setting the nickname!")));
                }
            })
            .catch((e) => console.log("Error setting the nickname!"));
    });
}

// Get the ELO of the user. Doesn't seem to be used right now
function getElo(message, name) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            message.reply("That user doesn't exist!");
            return;
        }

        let p1 = rows[0].elo;

        message.reply(name + "'s ELO is " + p1 + ".");
    });
}

// Get the stats of the user based on their name.
function getStats(message, name) {
    con.query(`SELECT * FROM rbridge WHERE name = ?`, [name], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        if (!rows[0]) {
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("`" + name + "` doesn't exist!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        }

        // Get the stats of the user.
        let namee = rows[0].name;
        let elo = rows[0].elo;
        let wins = rows[0].wins;
        let losses = rows[0].losses;
        let division = rows[0].division;
        let gamesPlayed = rows[0].games;

        // W/l is the wins/losses.
        let wl;
        if (losses === 0 || isNaN(wins / losses)) {
            // If losses are 0, it will return NaN. So, check if it isn't NaN.
            wl = wins;
        } else {
            // Round the w/l to the nearest tenth or hundredth.
            wl = (wins / losses).toFixed(2);
        }
        let winstreak = rows[0].winstreak;
        let bestWinstreak = rows[0].bestws;

        scoreCardTest(
            message,
            namee,
            elo,
            wins,
            losses,
            division,
            wl,
            gamesPlayed,
            winstreak,
            bestWinstreak
        );
    });
}

async function chartStats(message, name, nameTwo) {
    const chart = new QuickChart();

    con.query(`SELECT * FROM rbridge WHERE name = ?`, [name], async function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("`" + name + "` doesn't exist!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        }

        // Get the stats of the user.
        let namee = rows[0].name;
        let elo = rows[0].elo;
        let wins = rows[0].wins;
        let losses = rows[0].losses;
        let division = rows[0].division;
        let gamesPlayed = rows[0].games;

        // W/l is the wins/losses.
        let wl;
        if (losses === 0 || isNaN(wins / losses)) {
            // If losses are 0, it will return NaN. So, check if it isn't NaN.
            wl = wins;
        } else {
            // Round the w/l to the nearest tenth or hundredth.
            wl = (wins / losses).toFixed(2);
        }
        let winstreak = rows[0].winstreak;
        let bestWinstreak = rows[0].bestws;

        con.query(
            `SELECT * FROM rbridge WHERE name = ?`,
            [nameTwo],
            async function (erre, rowes, fields) {
                if (erre) throw erre;

                if (!rowes[0]) {
                    // Create a new embed.
                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("`" + nameTwo + "` doesn't exist!")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();
                    // Send the embd.
                    message.channel.send({ embeds: [notSetEmbed], files: [file] });
                    return;
                }

                // Get the stats of the user.
                let namee2 = rowes[0].name;
                let elo2 = rowes[0].elo;
                let wins2 = rowes[0].wins;
                let losses2 = rowes[0].losses;
                let division2 = rowes[0].division;
                let gamesPlayed2 = rowes[0].games;

                // W/l is the wins/losses.
                let wl2;
                if (losses2 === 0 || isNaN(wins2 / losses2)) {
                    // If losses are 0, it will return NaN. So, check if it isn't NaN.
                    wl2 = wins2;
                } else {
                    // Round the w/l to the nearest tenth or hundredth.
                    wl2 = (wins2 / losses2).toFixed(2);
                }
                let winstreak2 = rowes[0].winstreak;
                let bestWinstreak2 = rowes[0].bestws;

                chart.setConfig({
                    type: "bar",
                    data: {
                        labels: [
                            //"ELO",
                            "Wins",
                            "Losses",
                            "Games",
                            "W/L",
                            "Winstreak",
                            "Best Winstreak",
                        ],
                        datasets: [
                            {
                                label: namee,
                                backgroundColor: "rgba(255, 96, 84, 0.5)",
                                borderColor: "rgb(255, 96, 84)",
                                borderWidth: 1,
                                data: [
                                    //elo,
                                    wins,
                                    losses,
                                    gamesPlayed,
                                    wl,
                                    winstreak,
                                    bestWinstreak,
                                ],
                            },
                            {
                                label: namee2,
                                backgroundColor: "rgba(84, 255, 246, 0.5)",
                                borderColor: "rgb(84, 255, 246)",
                                borderWidth: 1,
                                data: [
                                    //elo2,
                                    wins2,
                                    losses2,
                                    gamesPlayed2,
                                    wl2,
                                    winstreak2,
                                    bestWinstreak2,
                                ],
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        legend: {
                            position: "top",
                        },
                        title: {
                            display: true,
                            text: "Compare " + namee + " and " + namee2,
                        },
                        plugins: {
                            //"backgroundImageUrl": 'https://images.cloudflareapps.com/EJzyxsCCQOeRa71a83tX_background-2.jpeg',
                            roundedBars: true,
                        },
                    },
                });
                const url = await chart.getShortUrl();
                await message.channel.send(url);
            }
        );
    });
}

// Get the stats of an user based on their ID (hence why it's "mention")
function getStatsMention(message, id) {
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id.id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("That user doesn't exist!")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        }

        let name = rows[0].name;
        let elo = rows[0].elo;
        let wins = rows[0].wins;
        let losses = rows[0].losses;
        let division = rows[0].division;
        let gamesPlayed = rows[0].games;

        // W/l is the wins/losses.
        let wl;
        if (losses === 0 || isNaN(wins / losses)) {
            // If losses are 0, it will return NaN. So, check if it isn't NaN.
            wl = wins;
        } else {
            // Round the w/l to the nearest tenth or hundredth.
            wl = Math.round((wins / losses + Number.EPSILON) * 100) / 100;
        }
        let winstreak = rows[0].winstreak;
        let bestWinstreak = rows[0].bestws;

        scoreCardTest(
            message,
            name,
            elo,
            wins,
            losses,
            division,
            wl,
            gamesPlayed,
            winstreak,
            bestWinstreak
        );
    });
}

// Get the ELO of an user based on a mention. Doesn't seem to be used right now (can probably delete)
function getEloMention(message, mention) {
    con.query(`SELECT * FROM rbridge WHERE id = '${mention.id}'`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const registeredEmbed = new Discord.MessageEmbed()
                .setColor("#10D365")
                .setTitle("That user doesn't exist!")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [registeredEmbed] });
            return;
        }

        let p1 = rows[0].elo;

        message.reply(mention.username + "'s ELO is " + p1 + ".");
    });
}

// Get the ELO leaderboard
function getELOLeaderboard(message) {
    con.query(`SELECT * FROM rbridge ORDER BY elo DESC LIMIT 10`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("There was an error getting the leaderboard!")
                .setDescription("Please ping Eltik.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                elo.push(parseInt(rows[i].elo));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("ELO Leaderboard")
            .addFields({
                name: "Leaderboard:",
                value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
            })
            .setTimestamp();
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function getWorstELOLeaderboard(message) {
    con.query(`SELECT * FROM rbridge ORDER BY elo ASC LIMIT 10`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const file = new MessageAttachment("../container/caution_gif.gif");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("There was an error getting the leaderboard!")
                .setDescription("Please ping Eltik.")
                .setThumbnail("attachment://caution_gif.gif")
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed], files: [file] });
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                elo.push(parseInt(rows[i].elo));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("ELO Leaderboard")
            .addFields({
                name: "Leaderboard:",
                value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
            })
            .setTimestamp();
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function getWinsLeaderboard(message) {
    con.query(
        `SELECT * FROM rbridge ORDER BY wins DESC LIMIT 10`,
        (err, rows) => {
            if (err) throw err;

            if (!rows[0]) {
                message.reply("That user doesn't exist!");
                return;
            }

            let elo = [];
            let names = [];
            for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                    elo.push(parseInt(rows[i].wins));
                    names.push(rows[i].name);
                }
            }
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Wins Leaderboard")
                .addFields({
                    name: "Leaderboard:",
                    value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
                })
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        }
    );
}

function getLossesLeaderboard(message) {
    con.query(
        `SELECT * FROM rbridge ORDER BY losses DESC LIMIT 10`,
        (err, rows) => {
            if (err) throw err;

            if (!rows[0]) {
                message.reply("That user doesn't exist!");
                return;
            }

            let elo = [];
            let names = [];
            for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                    elo.push(parseInt(rows[i].losses));
                    names.push(rows[i].name);
                }
            }
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Losses Leaderboard")
                .addFields({
                    name: "Leaderboard:",
                    value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
                })
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        }
    );
}

function getWinstreakLeaderboard(message) {
    con.query(
        `SELECT * FROM rbridge ORDER BY bestws DESC LIMIT 10`,
        (err, rows) => {
            if (err) throw err;

            if (!rows[0]) {
                message.reply("That user doesn't exist!");
                return;
            }

            let elo = [];
            let names = [];
            for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                    elo.push(parseInt(rows[i].bestws));
                    names.push(rows[i].name);
                }
            }
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Winstreak Leaderboard")
                .addFields({
                    name: "Leaderboard:",
                    value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
                })
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        }
    );
}

function getGamesLeaderboard(message) {
    con.query(
        `SELECT * FROM rbridge ORDER BY games DESC LIMIT 10`,
        (err, rows) => {
            if (err) throw err;

            if (!rows[0]) {
                message.reply("That user doesn't exist!");
                return;
            }

            let elo = [];
            let names = [];
            for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                    elo.push(parseInt(rows[i].games));
                    names.push(rows[i].name);
                }
            }
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Games Leaderboard")
                .addFields({
                    name: "Leaderboard:",
                    value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
                })
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        }
    );
}

function getScoreLeaderboard(message) {
    con.query(
        `SELECT * FROM scorers ORDER BY games DESC LIMIT 10`,
        (err, rows) => {
            if (err) throw err;

            if (!rows[0]) {
                message.reply("That user doesn't exist!");
                return;
            }

            let elo = [];
            let names = [];
            for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i] != "undefined" && typeof names != "undefined") {
                    elo.push(parseInt(rows[i].games));
                    names.push(rows[i].tag);
                }
            }
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Scorer Leaderboard")
                .addFields({
                    name: "Leaderboard:",
                    value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``,
                })
                .setTimestamp();
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        }
    );
}

async function calcElo(interaction, id, id2, winnerScore, loserScore, newGameNum) {
    console.log(
        "Scoring game for " + id + "and " + id2 + "."
    );

    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], async function (
        err,
        rowe,
        fields
    ) {
        if (rowe.length < 1) {
            console.log("Couldn't get the data for " + id + "!");
            interaction.channel.send("Couldn't get the data for <@" + id + ">.");
            return;
        }
        var player1Name = rowe[0].name;
        let p1 = rowe[0].elo;
        con.query(`SELECT * FROM rbridge WHERE id = ?`, [id2], async function (
            erre,
            rowes,
            fields
        ) {
            if (rowes.length < 1) {
                console.log("Couldn't get the data for " + id2 + "!");
                interaction.channel.send("Couldn't get the data for <@" + id2 + ">.");
                return;
            }
            var player2Name = rowes[0].name;
            let p2 = rowes[0].elo;

            if (interaction.channel != undefined) {
                interaction.channel.delete().catch((err) => console.error(err));
            }

            let p1Ranking = ranking.makePlayer(p1);
            let p2Ranking = ranking.makePlayer(p2);
            var matches = [];
            matches.push([p1Ranking, p2Ranking, 1])
            ranking.updateRatings(matches);

            var p1_elo = p1Ranking.getRating();
            var p2_elo = p2Ranking.getRating();

            var eloChange = Math.abs(p1_elo - p1);
            var negChange = Math.abs(p2_elo - p2);

            let change1 = Math.round(p1 + eloChange + (winnerScore / 4));
            let change2 = Math.round(p2 - eloChange + (loserScore / 2));

            setName(interaction, id, change1);
            scoreEloI(interaction, id, change1);
            setName(interaction, id2, change2);
            scoreEloI(interaction, id2, change2);

            console.log(
                "Scored game for " +
                player1Name +
                "and " + player2Name + "."
            );

            win(id);
            lose(id2);

            winStreak(id);
            loseStreak(id2);

            gamesPlayed(id);
            gamesPlayed(id2);

            let sql;
            console.log("Inserting game...");
            for (var i = 0; i < scoring.length; i++) {
                if (scoring[i][0] === id || scoring[i][0] === id2) {
                    scoring.splice(i, 1);
                }
            }
            con.query(
                'select count(*) as "count" from games',
                (erres, rowess) => {
                    if (erres) throw erres;
                    let gameNum = gamesE;
                    sql = `UPDATE games SET winnerid='${id}' WHERE gameid=${gameNum}`;
                    con.query(sql, (err) => {
                        if (err) throw err;
                    });
                    sql = `UPDATE games SET loserid='${id2}' WHERE gameid=${gameNum}`;
                    con.query(sql, (err) => {
                        if (err) throw err;
                    });

                    sql = `UPDATE games SET winnerelo=${change1} WHERE gameid=${gameNum}`;
                    con.query(sql, (err) => {
                        if (err) throw err;
                    });
                    sql = `UPDATE games SET loserelo=${change2} WHERE gameid=${gameNum}`;
                    con.query(sql, (err) => {
                        if (err) throw err;
                    });
                    con.query(
                        `SELECT * FROM scorers WHERE id = ${interaction.member.id}`,
                        (errore, rowesc) => {
                            let gamesScored = 0;
                            if (rowesc.length < 1) {
                                gamesScored = 0;
                            } else {
                                gamesScored = rowesc[0].games;
                            }
                            let newGames = (gamesScored += 1);
                            let asdfSql = `UPDATE scorers SET games = ${newGames} WHERE id = ${interaction.member.id}`;
                            con.query(asdfSql);
                            const notSetEmbed = new Discord.MessageEmbed()
                                .setColor("#2f3136")
                                .setTitle("Game " + newGameNum)
                                .setDescription("**Winner:** [`" + player1Name + "`]\n[`" + p1 + "` -> `" + change1 + "`]\n**Losers:** [`" + player2Name + "`]\n[`" + p2 + "` -> `" + change2 + "`]\n**Score:** `" + winnerScore + "-" + loserScore + "`")
                                .setFooter("Scored by " + interaction.member.user.tag)
                                .setTimestamp();
                            interaction.guild.channels.cache
                                .get(gamesChannel)
                                .send({ embeds: [notSetEmbed] });
                            console.log("Done! Scored game " + newGameNum + ".");
                            gamesE++;

                            let exp = 500 + 5;
                            let exp2 = 1 - 500 + (loserScore * 1.2);
                            updateLeveling(id, exp);
                            updateLeveling(id2, exp2);

                            logFile(
                                gameNum + " has been scored by " + interaction.member.user.tag + "."
                            );
                            logFile("Results:");
                            logFile(
                                "Winner: " +
                                player1Name +
                                "ELO Change: " +
                                player1Name +
                                ": " +
                                p1 +
                                " -> " +
                                change1 +
                                ". " +
                                player2Name +
                                ": " +
                                p2 +
                                " -> " +
                                change2 +
                                " Losers: " + player2Name
                            );
                        }
                    );
                }
            );
        });
    });
}

function win(id) {
    con.query(`SELECT wins FROM rbridge WHERE id = ?`, [id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            sql = `UPDATE rbridge SET wins = ${rows[0].wins + 1} WHERE id='${id}'`;
        }

        con.query(sql);
    });
}

function gamesPlayed(id) {
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            console.log("Couldn't find " + id + " in the database!");
        } else {
            let games = rows[0].games;
            let updateGames = (games += 1);
            sql = `UPDATE rbridge SET games = ${updateGames} WHERE id='${id}'`;
        }

        con.query(sql);
    });
}

function winStreak(id) {
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            sql = `UPDATE rbridge SET winstreak	 = ${rows[0].winstreak + 1
                } WHERE id='${id}'`;
            if (rows[0].winstreak + 1 > rows[0].bestws) {
                console.log(
                    "Current winstreak for " +
                    rows[0].name +
                    " is better than their best winstreak of " +
                    rows[0].bestws +
                    "."
                );
                console.log("Updating best winstreak...");
                updateBestWs(id, rows[0].winstreak + 1);
            }
            con.query(sql);
        }
    });
}

function updateBestWs(id, ws) {
    con.query(
        `UPDATE rbridge SET bestws = ${ws} WHERE id='${id}'`,
        (err, rows) => {
            if (err) throw err;
            console.log("Updated best winstreak.");
        }
    );
}

function loseStreak(id) {
    con.query(`SELECT winstreak FROM rbridge WHERE id = ?`, [id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            sql = `UPDATE rbridge SET winstreak	 = 0 WHERE id='${id}'`;
        }

        con.query(sql);
    });
}

function lose(id) {
    con.query(`SELECT losses FROM rbridge WHERE id = ?`, [id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            sql = `UPDATE rbridge SET losses = ${rows[0].losses + 1
                } WHERE id='${id}'`;
        }

        con.query(sql);
    });
}

function isString(value) {
    return typeof value === "string" || value instanceof String;
}

function writeToFile(message, date) {
    var fs = require("fs");
    var util = require("util");
    var logFile = fs.createWriteStream("dump-" + date + ".txt", { flags: "a" });
    var logStdout = process.stdout;

    logFile.write(util.format(message) + "\n");
    //logStdout.write(util.format(message) + '\n');
}

function logFile(message) {
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

    var fs = require("fs");
    var util = require("util");
    var logFile = fs.createWriteStream("log.txt", { flags: "a" });
    var logStdout = process.stdout;
    if (!message) {
        logFile.write(
            util.format("[" + time + "] " + "Could not get message.") + "\n"
        );
    } else {
        logFile.write(util.format("[" + time + "] " + message) + "\n");
    }
}

function transcribe(fileName, message) {
    var fs = require("fs");
    var util = require("util");
    var logFile = fs.createWriteStream("../container/tickets/" + fileName + ".txt", { flags: "a" });
    var logStdout = process.stdout;
    if (!message) {
        logFile.write(
            util.format("Could not get message.") + "\n"
        );
    } else {
        logFile.write(message + "\n");
    }
}

function sendTranscription(message, id, name, userID) {
    try {
        const data = fs.readFileSync("../container/tickets/" + id + ".txt", 'utf8');
        let key = "\n";
        const ticketTranscript = data.split(key);
        var util = require("util");
        var logFile = fs.createWriteStream("../container/tickets/" + id + ".html", { flags: "a" });
        var logStdout = process.stdout;
        logFile.write(`
    <!DOCTYPE html>
    <html>
    <head>
    	<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=PT Sans" />
    	<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Ubuntu" />
    	<title>Ranked Bridge Ticket Transcript</title>
    	<style>
    	</style>
    </head>
    <body>
      <h1>Ticket Transcript</h1>
    `);
        for (var i = 0; i < ticketTranscript.length; i++) {
            logFile.write(`<p>` + ticketTranscript[i] + `</p>\n`);
        }
        logFile.write(`
      </body>
      </html>
      `);
        setTimeout(function () {
            const file = new MessageAttachment("../container/tickets/" + id + ".html");
            const embed = new Discord.MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Transcript for " + id)
                .setDescription("Created by <@" + userID + ">.")
                .setTimestamp();
            // Send the embd.
            message.guild.channels.cache.get("948695798294650931").send({ embeds: [embed], files: [file] });
            message.guild.members.fetch(userID).then((member) => {
                try {
                    member.send({ embeds: [embed], files: [file] }).catch((err) => message.guild.channels.cache.get("943769767175680000").send("Couldn't DM <@" + userID + ">."));
                } catch (err) {
                    message.guild.channels.cache.get("948695798294650931").send("Couldn't get <@" + userID + ">.");
                }
            }).catch((err) => message.guild.channels.cache.get("948695798294650931").send("Couldnt get <@" + userID + ">."));
        }, 1000);
    } catch (e) {
        console.error(e);
    }
}

function purge(message, name) {
    con.query(`SELECT * FROM rbridge WHERE name = ?`, [name], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            message.reply("Can't find `" + name + "` in the database.");
        } else {
            sql = `DELETE FROM rbridge WHERE name = '${name}'`;
            message.reply("Purged `" + name + "`.");
            logFile("Purged " + name + ".");
        }

        con.query(sql);
    });
}

function purgeID(message, id) {
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], function (
        err,
        rows,
        fields
    ) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            console.log("Can't find `" + id + "` in the database.");
            message.reply("Couldn't find `" + id + "` in the database.");
        } else {
            sql = `DELETE FROM rbridge WHERE id = '${id}'`;
            console.log("Purged `" + id + "`.");
            message.reply("Purged `" + id + "`.");
        }

        con.query(sql);
    });
}

async function scoreCardTest(message, name, elo, wins, losses, division, wl, gamesPlayed, winStreak, bestWinstreak) {
    con.query(`SELECT * FROM rbridge WHERE name='${name}'`, (erre, rowes) => {
        if (erre) throw erre;
        let someId = rowes[0].id;
        con.query(`SELECT * FROM leveling WHERE id='${someId}'`, (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                console.log("User isn't in the leveling database. Inserting them...");
                sql = `INSERT INTO leveling(id, exp, level) VALUES('${someId}', 0, 0)`;
                con.query(sql);
                logFile("Inserted " + someId + " into the leveling table.");
                return;
            } else {
                let experience = rows[0].exp;
                let level = rows[0].level;
                if (level === null || !level) {
                    level = 0;
                }
                let amountToNextLevel = 0;

                if (level === 0) {
                    let smthLol = experience / 1000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 1) {
                    let smthLol = experience / 4000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 2) {
                    let smthLol = experience / 16000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 3) {
                    let smthLol = experience / 32000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 4) {
                    let smthLol = experience / 64000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 5) {
                    let smthLol = experience / 128000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 6) {
                    let smthLol = experience / 256000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 7) {
                    let smthLol = experience / 512000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 8) {
                    let smthLol = experience / 1024000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 9) {
                    let smthLol = experience / 2048000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 10) {
                    let smthLol = experience / 4096000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 11) {
                    let smthLol = experience / 8192000;
                    amountToNextLevel = 1 + smthLol;
                } else if (level === 11) {
                    let smthLol = experience / 16384000;
                    amountToNextLevel = 1 + smthLol;
                } else {
                    amountToNextLevel = 2;
                }

                const serverEmbed = new Discord.MessageEmbed()
                    .setColor("#2f3136")
                    .setTitle("Loading...")
                message.channel.send({ embeds: [serverEmbed] }).then((msg) => {
                    registerFont("fonts/Comfortaa.ttf", { family: "Comfortaa" });
                    registerFont("fonts/SourceSansPro.ttf", { family: "SourceSans" });
                    registerFont("fonts/Hubballi.ttf", { family: "Hubballi" });
                    registerFont("fonts/Audiowide.ttf", { family: "Audiowide" });
                    registerFont("fonts/Baloo2.ttf", { family: "Baloo2" });
                    registerFont("fonts/Oxanium.ttf", { family: "Oxanium" });
                    registerFont("fonts/Oxanium-Bold.ttf", { family: "OxaniumBold" });
                    registerFont("fonts/Rajdhani.ttf", { family: "Rajdhani" });

                    const canvas = createCanvas(3000, 2000);
                    const ctx = canvas.getContext("2d");

                    const file = new MessageAttachment("../container/caution_gif.gif");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle("Error getting stats card!")
                        .setDescription("Contact Eltik.")
                        .setThumbnail("attachment://caution_gif.gif")
                        .setTimestamp();

                    getUUID(name, message).then(async (id) => {
                        if (id === "undefined" || !id) {
                            return message.channel.send("id is undefined");
                        }
                        const image = await loadImage("images/baseCard.png").catch((err) => {
                            return message.channel.send("error loading base card");
                        });
                        const imagee = await loadImage(
                            "https://mc-heads.net/body/" + id + "/right"
                        ).catch((err) => {
                            return message.channel.send("error loading mc image");
                        });
                        if (!image || !imagee) {
                            return message.channel.send("image or imagee is undefined");
                        } else {
                            // Background image
                            //ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                            // Character image
                            ctx.drawImage(imagee, 450, 500, 180 * 2.3, 432 * 2.3);

                            // Base text
                            ctx.globalAlpha = 1;
                            ctx.font = '100px "SourceSans"';
                            ctx.fillStyle = "#666666";
                            ctx.fillText("Wins", 1420, 1200);
                            ctx.fillText("Losses", 2300, 1200);
                            ctx.fillText("W/L", 2360, 770);
                            ctx.fillText("Games", 1400, 770);
                            ctx.fillText("WS", 2365, 1700);
                            ctx.fillText("Best WS", 1400, 1700);

                            // Background box
                            ctx.globalAlpha = 0.1;
                            ctx.fillStyle = "#141414";
                            ctx.fillRect(1325, 500, 1400, 1275);


                            // Draw division icon background circle
                            ctx.globalAlpha = 0.2;
                            ctx.strokeStyle = "#141414";
                            ctx.beginPath();
                            ctx.arc(1550, 300, 125, 0 * Math.PI, 4 * Math.PI);
                            ctx.fill();

                            ctx.globalAlpha = 1;

                            // Load the division icons
                            const coalDiv = await loadImage("images/coal.png").catch((err) => {
                                return message.channel.send("error with loading coal");
                            });
                            const ironDiv = await loadImage("images/iron.png").catch((err) => {
                                return message.channel.send("error with loading iron");
                            });
                            const goldDiv = await loadImage("images/gold.png").catch((err) => {
                                return message.channel.send("error with loading gold");
                            });
                            const diamondDiv = await loadImage("images/diamond.png").catch((err) => {
                                return message.channel.send("error with loading diamond");
                            });
                            const emeraldDiv = await loadImage("images/emerald.png").catch((err) => {
                                return message.channel.send("error with loading emerald");
                            });
                            const obsidianDiv = await loadImage("images/obsidian.png").catch((err) => {
                                return message.channel.send("error with loading obsidian");
                            });
                            const crystalDiv = await loadImage("images/crystal.png").catch((err) => {
                                return message.channel.send("error with loading crystal");
                            });

                            // Draw the division icon
                            if (division === "COAL") {
                                ctx.drawImage(coalDiv, 1435, 175, 700 / 2.5, 700 / 2.5);
                            } else if (division === "IRON") {
                                ctx.drawImage(ironDiv, 1435, 175, 547 / 2.5, 600 / 2.5);
                            } else if (division === "GOLD") {
                                ctx.drawImage(goldDiv, 1435, 175, 547 / 2.5, 600 / 2.5);
                            } else if (division === "DIAMOND") {
                                ctx.drawImage(diamondDiv, 1435, 175, 547 / 2.5, 600 / 2.5);
                            } else if (division === "EMERALD") {
                                ctx.drawImage(emeraldDiv, 1435, 175, 547 / 2.5, 600 / 2.5);
                            } else if (division === "OBSIDIAN") {
                                ctx.drawImage(obsidianDiv, 1435, 175, 547 / 2.5, 600 / 2.5);
                            } else if (division === "CRYSTAL") {
                                ctx.drawImage(crystalDiv, 1435, 175, 547 / 2.5, 600 / 2.5);
                            }

                            // Draw level number text
                            ctx.fillStyle = "#66fff5";
                            ctx.font = '200px "SourceSans"';
                            ctx.fillText(level, 1875, 361);

                            // Draw level arc
                            ctx.globalAlpha = 0.1;
                            ctx.strokeStyle = "#141414";
                            ctx.beginPath();
                            ctx.arc(1926, 300, 125, 0 * Math.PI, 4 * Math.PI);
                            ctx.fill();
                            ctx.globalAlpha = 1;
                            ctx.strokeStyle = "#66fff5";
                            ctx.lineWidth = 10;
                            ctx.beginPath();
                            let degrees = amountToNextLevel * 360.0;
                            let radians = degrees * Math.PI / 180.0;
                            let s = (2 * (amountToNextLevel - 1)) * Math.PI;

                            ctx.arc(1926, 300, 125, s, radians + s, true);
                            ctx.stroke();

                            // IGN of the user
                            ctx.fillStyle = "#66fff5";

                            if (name.length > 9) {
                                ctx.font = '150px "Rajdhani"';
                                ctx.fillText(name + " ", 100, 350);
                            } else {
                                ctx.font = '200px "Rajdhani"';
                                ctx.fillText(name + " ", 100, 361);
                            }

                            /*
                            // Bar thing
                            ctx.globalAlpha = 0.5;
                            ctx.fillStyle = "#303030";
                            console.log((name.length * 4)^(name.length * 100));
                            ctx.fillRect(100, 400, (name.length * 4)^(name.length * 100), 25);
                            */

                            ctx.globalAlpha = 1;
                            // ELO text
                            ctx.font = '195px "Oxanium"';
                            ctx.fillStyle = "#4cad59";
                            if (elo < 1000) {
                                ctx.fillText(elo, 270, 1710);
                                ctx.fillStyle = "white";
                                ctx.fillText("ELO", 700, 1710);
                            } else {
                                ctx.fillText(elo, 170, 1710);
                                ctx.fillStyle = "white";
                                ctx.fillText("ELO", 700, 1710);
                            }

                            // Wins
                            ctx.font = '195px "OxaniumBold"';
                            ctx.fillStyle = "#70AD47";
                            if (wins > 9 && wins < 99) {
                                ctx.fillText(wins, 1420, 1100);
                            } else if (wins > 99) {
                                ctx.fillText(wins, 1370, 1100);
                            } else {
                                ctx.fillText(wins, 1480, 1100);
                            }

                            // Losses
                            ctx.fillStyle = "#C00000";
                            if (losses > 9 && losses < 99) {
                                ctx.fillText(losses, 2340, 1100);
                            } else if (losses > 99) {
                                ctx.fillText(losses, 2305, 1100);
                            } else {
                                ctx.fillText(losses, 2395, 1100);
                            }

                            // W/L
                            ctx.fillStyle = "white";
                            if (wl.toString().length < 2) {
                                ctx.fillText(wl + ".0", 2315, 670);
                            } else if (wl.toString().length === 3) {
                                ctx.fillText(wl, 2315, 670);
                            } else if (wl.toString().length === 2) {
                                ctx.fillText(wl + ".0", 2300, 670);
                            } else {
                                ctx.fillText(wl, 2300, 670);
                            }

                            // Games played
                            if (gamesPlayed > 9 && gamesPlayed < 99) {
                                ctx.fillText(gamesPlayed, 1420, 670);
                            } else if (gamesPlayed > 99) {
                                ctx.fillText(gamesPlayed, 1370, 670);
                            } else {
                                ctx.fillText(gamesPlayed, 1480, 670);
                            }

                            // Winstreak
                            ctx.fillStyle = "#70AD47";
                            if (winStreak > 9 && winStreak < 99) {
                                ctx.fillText(winStreak, 2340, 1600);
                            } else if (wins > 99) {
                                ctx.fillText(winStreak, 2305, 1600);
                            } else {
                                if (winStreak === 4) {
                                    ctx.fillText(winStreak, 2400, 1600);
                                } else {
                                    ctx.fillText(winStreak, 2390, 1600);
                                }
                            }

                            // Best winstreak
                            if (bestWinstreak > 9 && bestWinstreak < 99) {
                                ctx.fillText(bestWinstreak, 1420, 1600);
                            } else if (wins > 99) {
                                ctx.fillText(bestWinstreak, 1370, 1600);
                            } else {
                                ctx.fillText(bestWinstreak, 1480, 1600);
                            }

                            const buffer = canvas.toBuffer();
                            const attachment = new MessageAttachment(buffer, name + ".png");
                            fs.writeFile("./images/profiles/" + name + ".png", buffer, function (err) {
                                if (err) throw err;
                                msg.edit({ embeds: [], files: [attachment] }).catch((error) => console.error("Error: " + error));;
                            });
                        }
                    });
                });
            }
        });
    });
}

function updateLeveling(id, addExp) {
    con.query(`SELECT * FROM leveling WHERE id='${id}'`, (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
            console.log(id + " isn't in the leveling database. Inserting them...");
            sql = `INSERT INTO leveling(id, exp, level) VALUES('${id}', 0, 0)`;
            con.query(sql);
            logFile("Inserted " + id + " into the leveling table.");
            return;
        } else {
            let experience = rows[0].exp;
            let level = rows[0].level;
            let expP = experience += (addExp);

            if (expP > 1000 && level === 0) {
                sql = `UPDATE leveling SET level=1 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 4000 && level === 1) {
                sql = `UPDATE leveling SET level=2 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 16000 && level === 2) {
                sql = `UPDATE leveling SET level=3 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 32000 && level === 3) {
                sql = `UPDATE leveling SET level=4 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 64000 && level === 4) {
                sql = `UPDATE leveling SET level=5 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 128000 && level === 5) {
                sql = `UPDATE leveling SET level=6 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 256000 && level === 6) {
                sql = `UPDATE leveling SET level=7 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 512000 && level === 7) {
                sql = `UPDATE leveling SET level=8 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 1024000 && level === 8) {
                sql = `UPDATE leveling SET level=9 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 2048000 && level === 9) {
                sql = `UPDATE leveling SET level=10 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 4096000 && level === 10) {
                sql = `UPDATE leveling SET level=11 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 8192000 && level === 11) {
                sql = `UPDATE leveling SET level=12 WHERE id='${id}'`;
                con.query(sql);
            } else if (expP > 16384000 && level === 12) {
                sql = `UPDATE leveling SET level=13 WHERE id='${id}'`;
                con.query(sql);
            }
            sql = `UPDATE leveling SET exp=${expP} WHERE id='${id}'`;
            con.query(sql);
            logFile("Updated " + id + "'s experience to " + expP);
        }
    });
}

// Credit to @pelevesque
function getExpectedScore(ratingA, ratingB, n) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / n))
}

// Credit to elo-rank
function getExpected(a, b) {
    return 1 / ((Math.abs(a - b) / 200) + Math.pow(1, ((b - a) / 400)));
}

function getRatingDelta(ratingA, ratingB, score, k, n) {
    return k * (score - getExpectedScore(ratingA, ratingB, n))
}

function getOutcomeThing(ratingA, ratingB, score, k, n) {
    const delta = getRatingDelta(ratingA, ratingB, score, k, n)
    return {
        a: {
            delta: delta,
            rating: ratingA + delta
        },
        b: {
            delta: -delta,
            rating: ratingB - delta
        }
    }
}

function startGiveaway(message, numTime, a, numWinners, timeThing, msg) {
    setTimeout(function () {
        msg.delete();
        let numEntries = [];
        for (var i = 0; i < giveaway.length; i++) {
            let giveawaySplit = giveaway.toString().split(",");
            if (giveawaySplit[1] === a.toString() || giveaway[i][1] === a.toString()) {
                numEntries.push(giveaway[i][0]);
            }
        }
        let winners = [];
        for (var i = 0; i < numWinners; i++) {
            if (winners.length >= numEntries.length) {
                console.log("winners.length is >= to numentries.length");
            } else {
                let userWinner = Math.floor(Math.random() * (numEntries.length - 1)) + 1;
                /* FOr 2 winners
                let otherWinner;
                if ((userWinner) === numEntries.length) {
                  otherWinner = userWinner - 1;
                } else if ((userWinner) === 0) {
                  otherWinner = userWinner + 1;
                } else {
                  otherWinner = userWinner - 1;
                }
                winners.push("<@" + numEntries[otherWinner] + "> ");
                */
                winners.push("<@" + numEntries[userWinner] + "> ");
                break;
            }
        }
        console.log("Winenrs: " + winners);
        console.log("Entries: " + numEntries);
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle("Winners: " + winners)
            .setDescription("Entries: " + numEntries)
            .setTimestamp();
        message.channel.send({ embeds: [notSetEmbed] });
    }, numTime * timeThing);
}

function secondsSinceEpoch(d) {
    return Math.floor(d / 1000);
}

function warnUser(interaction, user, id, reason) {
    con.query(`SELECT * FROM warns WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        if (rows.length < 1) {
            console.log("User doesn't exist in warns table. Inserting them...");
            con.query(`INSERT INTO warns (id, warns) VALUES ('${id}', 0)`, async (erre, rowees) => {
                if (erre) throw erre;
                con.query(`UPDATE warns SET warns = 1 WHERE id='${id}'`, async (erress, roweees) => {
                    if (erress) throw erress;
                    const helpEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(user.username + " recieved a warn.")
                        .setDescription("Current warns: `1`\nReason: `" + reason + "`")
                        .setTimestamp();
                    // Send the embd.
                    interaction.reply({ embeds: [helpEmbed] });
                    interaction.guild.channels.cache
                        .get(punishmentsChannel)
                        .send({ embeds: [helpEmbed] });
                    logFile("Warned " + user.username + " (first warn).");
                });
            });
            return;
        } else {
            let warns = parseInt(rows[0].warns);
            if (warns >= 4) {
                console.log(user.username + "'s warns are greater or equal to 5. Warns: " + warns + ".");
                let testWarn = warns += 1;
                console.log("Test warn: " + testWarn);
                con.query(`UPDATE warns SET warns = ${(testWarn)} WHERE id='${id}'`, async (erre, rowees) => {
                    if (erre) throw erre;

                    const helpEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(user.username + " recieved a warn.")
                        .setDescription("Current warns: `" + testWarn + "`\nReason: `" + reason + "`")
                        .setTimestamp();
                    // Send the embd.
                    interaction.reply({ embeds: [helpEmbed] });
                    muteUser(interaction, message.author, 1, "Days", "Multiple warns.");

                    interaction.guild.channels.cache
                        .get(punishmentsChannel)
                        .send({ embeds: [helpEmbed] });
                    logFile("Warned " + user.username + " (first warn).");
                });

                logFile(user.username + " was warned (" + testWarn + " warns).");
                return;
            } else {
                console.log(user.username + "'s warns are less than 5. Warns: " + warns + ".");
                let testWarn = warns += 1;
                console.log("Test warn: " + testWarn);
                con.query(`UPDATE warns SET warns = ${(testWarn)} WHERE id='${id}'`, async (erre, rowees) => {
                    if (erre) throw erre;

                    const helpEmbed = new Discord.MessageEmbed()
                        .setColor("#2f3136")
                        .setTitle(user.username + " recieved a warn.")
                        .setDescription("Current warns: `" + testWarn + "`\nReason: `" + reason + "`")
                        .setTimestamp();
                    // Send the embd.
                    interaction.reply({ embeds: [helpEmbed] });
                    interaction.guild.channels.cache
                        .get(punishmentsChannel)
                        .send({ embeds: [helpEmbed] });
                    logFile("Warned " + user.username + ".");
                });
            }
        }
    });
}

onExit(function (code, signal) {
    logFile("Ranked Bridge unfortunately shut down. Code: " + code + ".  Signal: " + signal);
    console.log("Ranked Bridge shut down!");
})

for (const event of ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "SIGTERM"]) {
    //logFile("Ranked Bridge shutting down...");
    process.on(event, () => {
        console.log("event: " + event);
    });
}

function runBanLoop(message) {
    let currentTime = Date.now();
    con.query(`SELECT * FROM banned`, (err, rows) => {
        for (var i = 0; i < rows.length; i++) {
            let userID = rows[i].id;
            let timeBanned = rows[i].time;
            if (currentTime > timeBanned) {
                unbanUser(message, rows[i].name, "Timed unban.");
                return;
            }
        }
    });
}

function runMuteLoop(message) {
    let currentTime = Date.now();
    con.query(`SELECT * FROM muted`, (err, rows) => {
        for (var i = 0; i < rows.length; i++) {
            let userID = rows[i].id;
            let timeMuted = rows[i].time;
            if (currentTime > timeMuted) {
                unmuteUser(message, userID, rows[i].name);
                return;
            }
        }
    });
}

async function unmuteUser(interaction, user, name) {
    console.log(user);
    let userGet = await interaction.guild.members.fetch(user).catch(() => null);
    con.query(`DELETE FROM muted WHERE id = '${user}'`, (erre, row) => {
        if (erre) throw erre;
    });
    if (!userGet) {
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle(name + " is now unmuted.")
            .setTimestamp();
        // Send the embed.
        interaction.guild.channels.cache
            .get(punishmentsChannel)
            .send({ embeds: [notSetEmbed] });
        return;
    } else {
        userGet.roles.remove(muted);
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor("#2f3136")
            .setTitle(name + " is now unmuted.")
            .setTimestamp();
        // Send the embed.
        interaction.guild.channels.cache
            .get(punishmentsChannel)
            .send({ embeds: [notSetEmbed] });
    }
}

client.login(token);
