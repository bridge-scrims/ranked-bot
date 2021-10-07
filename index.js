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
const Discord = require('discord.js');

// Get prefix + token from config.json
const { prefix, token } = require('./config.json');
const client = new Discord.Client({ intents: ["GUILD_MEMBERS", "GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS"] })
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const { MessageAttachment } = require('discord.js');

// node-fetch
const fetch = require('node-fetch');

// mysql
const mysql = require("mysql");

// zikeji/hypixel
const { Client } = require("@zikeji/hypixel");
// Creates a new instance of Hypixel API (I think?) with an API key.
const hypixel = new Client("12c454dc-63d9-4215-95b2-fbf1022a81d0");

var EloRank = require('elo-rank');
var elo = new EloRank(32);

const wait = require('util').promisify(setTimeout);

// node-tesseract-ocr
// textract
// BASIC OCR THING (can remove later)
/*
*/

// Test is the queue array
let test = [];

// Reports is the number of report channels in an instance
let reports = [];
let support = [];

// Voided is the people who sent the command =void.
let voided = [];

// Scoring is the people who are waiting for games to be scored.
let scoring = [];

// ELO range is the elo range in which the bot will match two players.
const range = 100;

// Buttons, actions, etc. For latest version of Discord.JS.
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// When the bot starts up.
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Connection variables (changes as needed)
var con = mysql.createPool({
    connectionLimit: 100,
    host: "170.130.210.4",
    user: "u841_nYd1lapWNn",
    password: "7AcW57DEBdhH7YL@^Up^^GSe",
    database: "s841_ranked_bridge",
    debug: false
});

// Games is the amount of games played in an instance
let games = [];
con.query(`SELECT * FROM games`, (err, rows) => {
  if (rows === undefined || typeof rows === 'undefined') {
    console.log("rows is undefined");
    games.push(0);
    return;
  }
  if (rows.length < 1) {
    console.log('There are no games in the database!');
    games.push(0);
  } else {
    const game = rows[rows.length - 1].gameid;
    for (var i = 0; i < parseInt(game); i++) {
      games.push(games.length);
    }
  }
})

// When an user joins the server.
client.on('guildMemberAdd', member => {
    // Create an embed
    const helpEmbed = new Discord.MessageEmbed()
        .setColor('#10D365')
        .setTitle('Welcome ' + member.user.username + '!')
        .setDescription('Please visit <#877244968564039711> and <#877038997908627476> before registering!')
        .addFields(
            { name: 'Register using `=register <in-game username>`.', value: 'If you have trouble registering, create a ticket.' },
        )
        .setTimestamp()
    // Send the embed in the specific channel.
    member.guild.channels.cache.get("878278300508778588").send({ embeds: [helpEmbed] });
    // Send the gif.
    member.guild.channels.cache.get("878278300508778588").send("https://imgur.com/a/o8q6xKa");
})


client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'support') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Created ticket channel!");
            await supportChannel(interaction.guild, interaction.member.id);
        }

        if (interaction.customId === 'queue') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addQueuePing(interaction.guild, interaction.member.id);
        }

        if (interaction.customId === 'blue') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "blue");
        }

        if (interaction.customId === 'red') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "red");
        }

        if (interaction.customId === 'green') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "green");
        }

        if (interaction.customId === 'purple') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "purple");
        }

        if (interaction.customId === 'pink') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "pink");
        }

        if (interaction.customId === 'orange') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "orange");
        }

        if (interaction.customId === 'yellow') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Done!");
            await addRole(interaction.guild, interaction.member.id, "yellow");
        }

        if (interaction.customId === 'creator') {
            await interaction.deferReply({ ephemeral: true });
            await wait(2000);
            await interaction.editReply("Created ticket!");
            await creatorChannel(interaction.guild, interaction.member.id);
        }

        if (interaction.customId === 'void') {
            let j = 0;
            for (var i = 0; i < voided.length; i++) {
                if (voided[i][0] === interaction.member.id) {
                    break;
                } else {
                    j++;
                }
            }
            if (j < voided.length) {
                await interaction.deferReply({ ephemeral: true });
                await wait(2000);
                await interaction.editReply("Your opponent has to agree to void a game!");
            } else {
                if (!interaction.member.voice.channel || !interaction.member.voice.channel.name.includes("Game")) {
                    await interaction.deferReply({ ephemeral: true });
                    await wait(2000);
                    await interaction.editReply("You need to be connected to a voice channel!");
                } else {
                    for (var i = 0; i < voided.length; i++) {
                        if (voided[i][1] === interaction.channel.name) {
                            voided.splice(i, 1);
                        }
                    }
                    await interaction.deferReply({ ephemeral: true });
                    await wait(2000);
                    if (interaction.channel === null || interaction.channel === "null") {
                        console.log("Channel is null! Scam.");
                        return;
                    } else {
                      interaction.channel.delete();
                      interaction.member.voice.channel.delete();
                    }
                }
            }
        }

        if (interaction.customId === 'score') {
            let j = 0;
            for (var i = 0; i < scoring.length; i++) {
                if (scoring[i][0] === interaction.member.id) {
                    break;
                } else {
                    j++;
                }
            }
            if (j < scoring.length) {
                await interaction.deferReply({ ephemeral: true });
                await wait(2000);
                await interaction.editReply("Your opponent has to agree to score a game!");
            } else {
              if (interaction.member.voice.channel === null || interaction.member.voice === null || interaction.member.voice.channel === "null" || interaction.member.voice === "null") {
                return;
              } else {
                if (interaction.member.voice.channel.name.includes("Game")) {
                    if (!interaction.member.voice.channel || !interaction.member.voice.channel.name.includes("Game")) {
                        await interaction.deferReply({ ephemeral: true });
                        await wait(2000);
                        await interaction.editReply("You need to be connected to a voice channel!");
                    } else {
                        for (var i = 0; i < scoring.length; i++) {
                            if (scoring[i][1] === interaction.channel.name) {
                                scoring.splice(i, 1);
                            }
                        }
                        await interaction.deferReply({ ephemeral: true });
                        await wait(2000);
                        if (interaction.member.voice.channel === null || interaction.member.voice.channel === "null") {
                          await interaction.editReply("Channel is null! Try again.");
                          return;
                        } else if (interaction.member.voice.channel.name.includes("Game")){
                          interaction.member.voice.channel.delete();
                        }
                        interaction.channel.permissionOverwrites.set([
                            {
                                id: interaction.channel.guild.roles.everyone,
                                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                            },
                            {
                                id: "882754787580457012",
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                            },
                        ]);
                        interaction.channel.setName(interaction.channel.name + "-finished");
                        const scoreEmbed = new Discord.MessageEmbed()
                            .setColor('#10D365')
                            .setTitle(interaction.channel.name + ' is ready to be scored!')
                            .setDescription('Use `=game <@winner> <@loser>` to score the game.')
                            .setTimestamp()
                        interaction.guild.channels.cache.get("891435312625090620").send({ embeds: [scoreEmbed] });
                    }
                } else {
                  await interaction.deferReply({ ephemeral: true });
                  await wait(2000);
                  await interaction.editReply("You need to be connected to the game vc.");
                }
              }
            }
        }
    }
});

// When a message is sent...
client.on('messageCreate', async message => {
    // Argument related.
    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice().toLowerCase();
    /*
    if (message.content === `${prefix}test`) {
        if (message.member.roles.cache.some(r => r.name === "Staff")) {
            con.query(`Alter table rbridge ADD(bestws int(10) Default '0');`, (err, rows) => {
                if (err) throw err;
            })
            message.reply("success??");
        }
    }

    if (message.content === `${prefix}drop`) {
        if (message.member.roles.cache.some(r => r.name === "Staff")) {
            con.query(`ALTER table rbridge drop column bestws`, (err, rows) => {
                if (err) throw err;
            })
            message.reply("success??");
        }
    }
    */

    if (message.content === `${prefix}void`) {
        if (!message.channel.name.includes("game")) {
          message.reply("You need to send this command in the game channel!");
          return;
        } else {
          if (!message.member.voice.channel || !message.member.voice.channel.name.includes("Game")) {
            message.reply("You need to be connected to the Game VC to send this command!");
            return;
          } else {
              const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('void')
                            .setLabel('Void Game')
                            .setStyle('PRIMARY'),
                    );

                    const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Void Game')
                    .setDescription('If you want to void the game, click the button below.');

              await message.channel.send({ ephemeral: true, embeds: [embed], components: [row] });
              await voided.push([message.member.id, message.channel.name]);
          }
        }
    }

    // Help command
    if (message.content === `${prefix}help`) {
        // Create a new embed.
        const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Help')
            .addFields(
                { name: '=help', value: 'Displays this message.' },
                { name: '=register <username>', value: 'Register your account to Ranked Bridge.' },
                { name: '=rename <username>', value: 'If you changed your account\'s IGN, use this command.' },
                { name: '=score', value: 'Scoring command. Can only be used in your game channel.' },
                { name: '=leaderboard [elo/wins/losses/games/winstreak]', value: 'Displays the top 10 players in terms of ELO, wins, or losses.' },
                { name: '=stats [user]', value: 'Displays stats for either yourself or another user.' },
                { name: '=screenshare [user]', value: 'Use this if you want to screenshare someone.' },
                { name: '=report [user]', value: 'Use this if you want to report someone for breaking the rules (in-game or in the Discord).' },
                { name: '=void', value: 'Use this if you want to void a game. In order for the void to take effect, your opponent also has to agree to void the game.' },
                { name: '=nick <hide | reset | some_value>', value: '**Booster ONLY** Boosters can hide their ELO from their display name (`=nick hide`) or add text after their username (`=nick <some_text_here>`).' },
            )
            .setTimestamp()
        // Send the embd.
        message.channel.send({ embeds: [helpEmbed] });
    }

    // Score command
    if (message.content === `${prefix}score`) {
        // If the channel isn't in a category...
        if (!message.channel.parent) {
            // If the channel doesn't include the name "game".
            if (!message.channel.name.includes("game")) {
                const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('You can only score games in game channels!')
                .setTimestamp()
                // Send the embd.
                message.channel.send({ embeds: [helpEmbed] });
            } else {
                // If there wasn't an attachment sent...
                if (!message.attachments.first()) {
                    const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('Please attach an image to the message!')
                    .setTimestamp()
                    // Send the embd.
                    message.channel.send({ embeds: [helpEmbed] });
                } else {
                    // If the user isn't in a voice channel that includes the name "Game" or isn't in a voice channel at all...
                    if (!message.member.voice.channel || !message.member.voice.channel.name.includes("Game")) {
                        const helpEmbed = new Discord.MessageEmbed()
                            .setColor('#10D365')
                            .setTitle('You need to be connected to the game VC to score games!')
                            .setTimestamp()
                        // Send the embd.
                        message.channel.send({ embeds: [helpEmbed] });
                    } else {
                        // Ping scorers, delete the voice channel they're in, and rewrite permissions.
                        const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('score')
                                .setLabel('Score Game')
                                .setStyle('PRIMARY'),
                        );
                        const scoreEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle('Click the button if the screenshot is correct.')
                        .setDescription('If the opponent does not click the button, feel free to ping the Scorer role.')
                        .setTimestamp()
                        if (message.channel != null && message.channel != "null") {
                          await message.channel.send({ ephemeral: true, embeds: [scoreEmbed], components: [row] });
                          await scoring.push([message.member.id, message.channel.name]);
                        }
                        // Send the embed.
                    }
                }
            }
        } else {
            // If the user didn't send a command in a game channel.
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Please send this command in your game channel!')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    }

    // Register command
    if (cmd === "=register") {
        // If the command wasn't sent in the register channel...
        if (message.channel.id === "878278300508778588") {
            // Get the UUID of the user based on the second args, then get the username from MojangAPI and then get the user's Discord.
            getUUID(args[1], message).then(id => {
                let trimmed = id;
                if (isString(trimmed)) {
                    let eight = trimmed.slice(0, 8);
                    let twelve = trimmed.slice(8, 12);
                    let sixteen = trimmed.slice(12, 16);
                    let twenty = trimmed.slice(16, 20);
                    let thirtytwo = trimmed.slice(20, 32);
                    let uuid = eight + "-" + twelve + "-" + sixteen + "-" + twenty + "-" + thirtytwo;
                    getUsername(args[1], message).then(name => {
                        getDiscord(id, message, name);
                    })
                }
            })
        }
    }

    // Score command for Admins/scorers.
    if (cmd === "=game") {
        // If the user has the role "Scorer"...
        if (message.member.roles.cache.some(r => r.name === "Scorer")) {
            // If the channel isn't in a category...
            if (!message.channel.parent) {
                // If the arguments are greater or less than 3...
                if (args.length < 3 || args.length > 3) {
                    const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('Not enough arguments! Usage: `=game @winner @loser`.')
                    .setTimestamp()
                    // Send the embd.
                    message.channel.send({ embeds: [helpEmbed] });
                } else {
                    // Mention is the first user mentioned in the message.
                    let mention = message.mentions.users.first();
                    // If there isn't an user mentioned...
                    if (!mention && !getUserFromMention(args[2])) {
                        // Get the users from the command sent.
                        var user = args[1];
                        var user2 = args[2];
                        // Calculate the ELO based on the arguments, then score the game and delete the channel.
                        calcElo(message, user, user2);
						/** TODO
						 * Possibly change this so that it archives it for staff to see?
						**/
                        message.channel.delete();
                    } else {
                        const user = getUserFromMention(args[2]);
                        if (!user || !mention || !args[1].startsWith("<") || !args[2].startsWith("<")) {
                            const helpEmbed = new Discord.MessageEmbed()
                            .setColor('#10D365')
                            .setTitle('You need to mention a proper user.')
                            .setTimestamp()
                            // Send the embd.
                            message.channel.send({ embeds: [helpEmbed] });
                        } else {
                            // If there WAS an user mentioned...
                            // Calculate the ELO, then score the game and delete the channel.
                            calcElo(message, mention.id, user.id);
							/** TODO
							 * Possibly change this so that it archives it for staff to see?
							**/
                            message.channel.delete();
                        }
                    }
                }
            } else {
                const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Plase send this command in the game channel!')
                .setTimestamp()
                // Send the embd.
                message.channel.send({ embeds: [helpEmbed] });
            }
        } else {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('You don\'t have permission!')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    }

    // Rename command.
    if (cmd === "=rename") {
        // If there are invalid arguments...
        if (args.length < 2 || args.length > 2) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Invalid arguments! Correct usage: `=rename Freecape`')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            message.reply("Please input valid arguments. Ex. `=rename Freecape`");
        } else {
            // Get the ID of the user, than their username, and then rename the user.
            getUUID(args[1], message).then(id => {
                let trimmed = id;
                if (isString(trimmed)) {
                    let eight = trimmed.slice(0, 8);
                    let twelve = trimmed.slice(8, 12);
                    let sixteen = trimmed.slice(12, 16);
                    let twenty = trimmed.slice(16, 20);
                    let thirtytwo = trimmed.slice(20, 32);
                    let uuid = eight + "-" + twelve + "-" + sixteen + "-" + twenty + "-" + thirtytwo;
                    getUsername(args[1], message).then(name => {
                        rename(id, message, name);
                    })
                }
            })
        }
    }
    //If the command =leaderboard or =lb is typed then get the leaderboard
    if (cmd === '=leaderboard' || cmd === '=lb') {
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
            } else {
                // If there are excess arguments, then send the ELO leaderboard.
                getELOLeaderboard(message);
            }
        }
    }
    //If the command =stats, =info, =i, =s is passed...
    if (cmd === "=stats" || cmd === "=info" || cmd === "=i" || cmd === "=s") {
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

    if (cmd === "=report") {
        if (args.length < 2) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Invalid arguments! Use `=report <user>` to report someone.')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        } else {
            reportChannel(message, message.author.id);
        }
    }

    if (cmd === "=screenshare" || cmd === "=ss") {
        if (args.length < 2 || args.length > 2) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Invalid arguments! Use `=ss <user>` to screenshare someone.')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        } else {
            screenshareChannel(message, message.author.id, message.author.username);
        }
    }

    if (message.content === `${prefix}close`) {
        if (message.channel.name.includes("game") || message.channel.name.includes("report") || message.channel.name.includes("screenshare") || message.channel.name.includes("support")) {
            if (!message.member.roles.cache.some(r => r.name === "Staff")) {
                const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Only staff can close channels!')
                .setDescription('This system will likely be redone so players can close channels and staff can delete them.')
                .setTimestamp()
                // Send the embd.
                message.channel.send({ embeds: [helpEmbed] });
            } else {
                message.channel.delete();
            }
        } else {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('You can only close game, report, or screenshare channels!')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    }

    if (cmd === "=set") {
        if (args.length < 5) {
            if (message.member.roles.cache.some(r => r.name === "Staff")) {
                if (args[1] === "elo") {
                    setElo(message, args[2], args[3]);
                } else if (args[1] === "wins") {
                    setWins(message, args[2], args[3]);
                } else if (args[1] === "losses") {
                    setLosses(message, args[2], args[3]);
                } else if (args[1] === "winstreak") {
                    setWinstreak(message, args[2], args[3]);
                } else {
                    const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('Unknown arguments! Usage: `/set <elo | wins | losses | winstreak> <user> <amount>`')
                    .setTimestamp()
                    // Send the embd.
                    message.channel.send({ embeds: [helpEmbed] });
                    return;
                }
            } else {
                const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('You don\'t have permission!')
                    .setTimestamp()
                // Send the embd.
                message.channel.send({ embeds: [helpEmbed] });
                return;
            }
        } else {
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Invalid arguments! Usage: `/set <elo | wins | losses | winstreak> <user> <amount>`')
                .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
            return;
        }
    }

    // Freeze command. Isn't working; need to do redo.
	if (cmd === "=freeze") {
		if (!message.member.roles.cache.some(r => r.name === "Staff")) {
			message.reply("You don't have permission!");
		} else if (args.length < 2) {
			message.reply("Incorrect arguments! Usage: `=freeze @<user>`");
		} else {
            var role = message.member.guild.roles.cache.find(role => role.id === "885269051125932113");
            let mention = message.mentions.members.first();
            // If there isn't an user mentioned...
            if (!mention) {
                message.reply("Please mention an user!");
            } else {
                mention.roles.add(role);
                mention.roles.remove("877244655866093638");
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle(mention.nickname + ' is frozen.')
                    .setTimestamp()
                // Send the embed.
                message.channel.send({ embeds: [notSetEmbed] });
            }
	    }
    }

    if (cmd === "=strike") {
      if (!message.member.roles.cache.some(r => r.name === "Staff")) {
  			message.reply("You don't have permission!");
  		} else {
        if (args.length < 2) {
            message.reply("Incorrect arguments! Correct usage: `=strike <user>`");
        } else {
            strike(message, args[1]);
        }
      }
    }

    if (cmd === "=ban") {
      if (!message.member.roles.cache.some(r => r.name === "Staff")) {
  			message.reply("You don't have permission!");
  		} else {
        if (args.length < 3) {
          message.reply("Incorrect arguments! Correct usage: `=ban <user> <time>`");
        } else {
          con.query(`SELECT * FROM rbridge WHERE name = '${args[1]}'`, (err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
              message.reply("Couldn't get `" + args[1] + "` in the database!");
              return
            } else {
              banUser(message, rows[0].name, args[2]);
            }
          })
        }
      }
    }

    if (cmd === "=mute") {
        if (!message.member.roles.cache.some(r => r.name === "Staff")) {
                message.reply("You don't have permission!");
            } else {
          if (args.length < 3) {
            message.reply("Incorrect arguments! Correct usage: `=mute <user> <time>`");
          } else {
            con.query(`SELECT * FROM rbridge WHERE name = '${args[1]}'`, (err, rows) => {
              if (err) throw err;
              if (rows.length < 1) {
                message.reply("Couldn't get `" + args[1] + "` in the database!");
                return
              } else {
                muteUser(message, rows[0].name, args[2]);
              }
            })
          }
        }
      }

    if (cmd === "=purge") {
        if (message.member.roles.cache.some(r => r.name === "Staff")) {
            if (args.length < 2) {
                message.reply("Not enough arguments! Correct usage: `=purge <user>`.");
            } else {
                purge(message, args[1]);
            }
        } else {
            message.reply("You don't have permission!");
        }
    }

    if (cmd === "=nick") {
        if (message.member.roles.cache.some(r => r.name === "Staff") || message.member.roles.cache.some(r => r.name === "Booster")) {
            if (args.length < 2) {
                message.reply("Not enough arguments! Correct usage: `=nick <hide | reset | some_word>`");
            } else {
                if (args[1] === "hide") {
                    con.query(`SELECT * FROM rbridge WHERE id = '${message.author.id}'`, (err, rows) => {
                        if (err) throw err;
                        if (rows.length < 1) {
                          message.reply("You're not in the database!");
                          return
                        } else {
                            message.member.setNickname(rows[0].name);
                            message.reply("Hid your ELO.");
                        }
                    })
                } else if (args[1] === "reset") {
                    con.query(`SELECT * FROM rbridge WHERE id = '${message.author.id}'`, (err, rows) => {
                        if (err) throw err;
                        if (rows.length < 1) {
                          message.reply("You're not in the database!");
                          return
                        } else {
                            message.member.setNickname("[" + rows[0].elo + "] " + rows[0].name);
                            message.reply("Reset your nickname.");
                        }
                    })
                } else {
                    console.log(args[1].length);
                    if (message.member.displayName.includes("(")) {
                      message.reply("You already have a nick!");
                      return;
                    }
                    if ((message.member.displayName + args[1]).length < 32) {
                        message.member.setNickname(message.member.displayName + " (" + args[1] + ")");
                        message.reply("Set your nickname to `" + message.member.displayName + "`.");
                    } else {
                        message.reply("Your current nickname is too long! Use `=nick reset` to reset your nickname.");
                    }
                }
            }
        } else {
            message.reply("You don't have permission! You need to be a Booster or Staff.");
        }
    }
})

// When something happens in a VC...
client.on('voiceStateUpdate', (oldState, newState) => {
    // Queue channel
    let mainChannel = '894317815740370964';
    let testingChannel = '889287515301883904';
    // If the user leaves teh VC...
    if (oldState.channelID === null || typeof oldState.channelID === 'undefined') {
      let memberID = oldState.member.id;
      // Get the user ID.
      if (exists(test, memberID)) {
          // Check whether the user exists in the array.
        for (var i = 0; i < test.length; i++) {
            // Loop through the array.
          if (test[i][0] === memberID) {
              // If the ID of the current loop is equal to the memberID...
            console.log("User left the voice channel. Removing them from the array...");
            test.splice(i, 1);
            // Remove them from the array and break.
            break;
          }
        }
      }
    }
    // If the channel the user is in is equal to the queue channel...
    if (newState.channelId === mainChannel || newState.channelId === testingChannel) {
        let memberID = newState.member.id;
        if (!exists(test, memberID)) {
          // If the user exists in the array...
          console.log(memberID + " joined the queue VC.");
          con.query(`SELECT * FROM rbridge WHERE id = '${newState.member.id}'`, (err, rows) => {
            if (err) throw err;
            let ready = false;
            let skipse = 0;
            let userElo = rows[0].elo;
            test.push([memberID, userElo, 0]);
            var timer = setInterval(function() {
              let member = newState.member;
              // Get the user ID...
              // Add them to a 2D arrary with the values: [id, elo, skips]

              // If there is more then one person in the VC...
              if (test.length > 1) {
                  // Sort the array based on ELO.
                  test.sort((a,b) => a[1] - b[1]);
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
                                  matchMake(user1, user2, member);
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
                                  matchMake(user1, user2, member);
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
            }, 5000);
          })
        } else {
            console.log(memberID + " was already in the array.");
        }
    }
});

function matchMaking(memberID, skipse, member) {
    // Get the user ID...
    let userElo = rows[0].elo;
    // Add them to a 2D arrary with the values: [id, elo, skips]

    // If there is more then one person in the VC...
    if (test.length > 1) {
        // Sort the array based on ELO.
        test.sort((a,b) => a[1] - b[1]);
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
                    if (diff1 < (range + (test[memberIndex - 1][2] + test[memberIndex][2]) * skipse * 20)) {
                        // If the difference is less than 40 and accounts for skips...
                        console.log("Matched " + test[memberIndex][0] + " and " + test[memberIndex - 1][0] + "!");
                        // Get the two users.
                        const user1 = test[memberIndex - 1][0];
                        const user2 = test[memberIndex][0];
                        // Remove them from the array.
                        test.splice(memberIndex - 1, 2);
                        // Create the channels.
                        matchMake(user1, user2, member);
                    } else {
                        // If newMember elo is closest to the elo below it...
                        // Add skips to both users.
                        test[memberIndex][2]++;
                        test[memberIndex - 1][2]++;
                        console.log("Updated skips since we weren't able to match users.");
                    }
                }
                if (diff2 < diff1) {
                    // If newMember elo is closest to elo below it...
                    if (diff2 < (range + (test[memberIndex + 1][2] + test[memberIndex][2]) * skipse * 20)) {
                        // If the difference is less than 40 and accounts for skips...
                        console.log("Matched " + test[memberIndex][0] + " and " + test[memberIndex + 1][0] + "!");
                        const user1 = test[memberIndex + 1][0];
                        const user2 = test[memberIndex][0];
                        test.splice(memberIndex, 2);
                        matchMake(user1, user2, member);
                        break;
                    } else {
                        test[memberIndex][2]++;
                        test[memberIndex + 1][2]++;
                        console.log("Updated skips since we weren't able to match users.");
                    }
                }
            }
        }
    }
}

// Checks whether users exist.
function exists(arr, search) {
    return arr.some(row => row.includes(search));
}

function matchMake(user1, user2, member) {
  console.log("About to make channel for " + user1 + " and " + user2 + ".");
  makeChannel(member, user1, user2);
}

// Get an user from the mention.
function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

// Make the channel
function makeChannel(message, player1, player2) {
    // Get the two users based on their ID.
    var user = message.guild.members.cache.get(player1);
    var user2 = message.guild.members.cache.get(player2);

    con.query(`SELECT * FROM games`, (err, rows) => {
      games.push(games.length);
      const game = games.length;

      // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
      message.guild.channels.create("game-" + game, {
          permissionOverwrites: [
              {
                  id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                  deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
              },
              {
                  // But allow the two users to view the channel, send messages, and read the message history.
                  id: user.id,
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
              },
              {
                  id: user2.id,
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
              },
              {
                  id: '882750156905275402',
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
              },
              {
                  id: '877309777741500487',
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
              },
              {
                  id: '882754787580457012',
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
              }
          ],
      });
      // Create the Game x VC
      message.guild.channels.create("Game " + game, {
          type: 'GUILD_VOICE',
          permissionOverwrites: [
              {
                  id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                  deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'] //Deny permissions
              },
              {
                  id: user.id,
                  allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
              },
              {
                  id: user2.id,
                  allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
              },
              {
                  id: '882750156905275402',
                  allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
              },
              {
                  id: '877309777741500487',
                  allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
              },
              {
                  id: '882754787580457012',
                  allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
              }
          ],
      });

      console.log("Made channel game-" + games.length + " and voice channel Game " + games.length);

      // Move the users to that VC after 2 seconds.
      setTimeout(function () {
          console.log("Current game: " + game);
          // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
          var channelID = message.guild.channels.cache.find(c => c.name === "Game " + game).id;
          var messageID = message.guild.channels.cache.find(c => c.name === "game-" + game).id;
          // Send the embed.
          con.query(`SELECT * FROM rbridge WHERE id = '${player1}'`, (erres, rowse) => {
              if (erres) throw erres;

              if (rowse.length < 1) {
                  message.channel.send("Couldn't get users!");
              } else {
                  let name1 = rowse[0].name;
                  con.query(`SELECT * FROM rbridge WHERE id = '${player2}'`, (erre, rowses) => {
                      if (erre) throw erre;
                      let name2 = rowses[0].name;
                      message.guild.channels.cache.get(messageID).send('<@' + player1 + '> <@' + player2 + '>');
                      const errorEmbed = new Discord.MessageEmbed()
                          .setColor('#10D365')
                          .setTitle(`Game ` + game)
                          .setDescription('Use `/duel <user> bridge` to duel the other player! Remember, games are best of 1. If you need help, visit <#877038997908627476>.')
                          .setTimestamp()
                      if (!user.voice.channel || user.voice.channel === "undefined" || typeof user.voice.channel === 'undefined') {
                          console.log("voice is unknown");
                          return;
                      } else if (!user2.voice.channel) {
                          user.voice.setChannel(channelID);
                      } else {
                          user.voice.setChannel(channelID);
                          user2.voice.setChannel(channelID);
                      }
                      message.guild.channels.cache.get(messageID).send({ embeds: [errorEmbed] });
                      message.guild.channels.cache.get(messageID).send("`/duel " + name1 + " bridge`");
                      message.guild.channels.cache.get(messageID).send("`/duel " + name2 + " bridge`");
                  })
              }
          })
      }, 2000);
    })
}

// Report channel
function reportChannel(message, id) {
    // Get the two users based on their ID.
    var user = message.guild.members.cache.get(id);

    // If the games array is not equal to 0, add to it.
    if (reports != 0) {
        reports.push(reports.length++);
    } else {
        // Otherwise, game[0] is equal to [0].
        reports.push(0);
    }

    // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
    message.guild.channels.create("report-" + reports.length, {
        permissionOverwrites: [
            {
                id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
            },
            {
                // But allow the two users to view the channel, send messages, and read the message history.
                id: user.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
            },
            {
                id: '882750156905275402',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
            },
            {
                id: '877309777741500487',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
            }
        ],
    });
    // Move the users to that VC.
    setTimeout(function () {
        // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
        var channelID = message.guild.channels.cache.find(c => c.name === "report-" + reports.length).id;
        const errorEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle(`Please fill out the following:`)
            .addFields(
                { name: '1. The user you are reporting.', value: 'Ex. Eltik' },
                { name: '2. What rule they broke.', value: 'Ex. Racism, lag back.' },
                { name: '3. Any proof you have.', value: 'Ex. Image, Discord link, etc.' },
            )
            .setTimestamp()
        // Send the embd.
        message.guild.channels.cache.get(channelID).send({ embeds: [errorEmbed] });
    }, 2000);
}

// Support channel
function supportChannel(guild, id) {
    // Get the two users based on their ID.
    var user = guild.members.cache.get(id);

    if (support != 0) {
        support.push(support.length++);
    } else {
        // Otherwise, game[0] is equal to [0].
        support.push(0);
    }
    if (user.nickname === null || user === null) {
        console.log("User is null!");
        return;
    }

    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (rows.length < 1) {
            console.log("User doesn't exist!");
            return;
        }
        let lowercase = rows[0].name.toLowerCase();
        let title = "support-" + lowercase;
        console.log(title);
        // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
        guild.channels.create(title, {
            permissionOverwrites: [
                {
                    id: guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
                },
                {
                    // But allow the two users to view the channel, send messages, and read the message history.
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: '882750156905275402',
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: '877309777741500487',
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ],
        });
        // Move the users to that VC.
        setTimeout(function () {
            // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
            var channelID = guild.channels.cache.find(c => c.name === title).id;
            const errorEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle(`Staff will be with you shortly! Please let us know what you need help with.`)
                .setTimestamp()
            // Send the embd.
            guild.channels.cache.get(channelID).send({ embeds: [errorEmbed] });
        }, 2000);
    })
}

function addQueuePing(guild, id) {
  var user = guild.members.cache.get(id);
  if (user.nickname === null || user === null) {
      console.log("User is null!");
      return;
  }
  let roleId = "883791592073330758";
  var role = guild.roles.cache.find(role => role.id === roleId);
  if (user.roles.cache.has(roleId)) {
      user.roles.remove(role);
  } else {
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
        if (rows.length < 1) {
            console.log("User doesn't exist!");
            return;
        }
        let lowercase = rows[0].name.toLowerCase();
        let title = "creator-" + lowercase;
        console.log(title);
        // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
        guild.channels.create(title, {
            permissionOverwrites: [
                {
                    id: guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
                },
                {
                    // But allow the two users to view the channel, send messages, and read the message history.
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: '882750156905275402',
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: '877309777741500487',
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ],
        });
        // Move the users to that VC.
        setTimeout(function () {
            // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
            var channelID = guild.channels.cache.find(c => c.name === title).id;
            const errorEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle(`Application for Creator`)
                .setDescription('Please fill out the following:\n ```1. Why you want to apply for creator.\n 2. How many subscribers you have.\n 3. What content you make. 4. Link to your YouTube channel.```')
                .setTimestamp()
            // Send the embd.
            guild.channels.cache.get(channelID).send({ embeds: [errorEmbed] });
        }, 2000);
    })
}

// Screenshare channel
function screenshareChannel(message, id, arg) {
    // Get the two users based on their ID.
    var user = message.guild.members.cache.get(id);

    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (rows.length < 1) {
            console.log("User doesn't exist!");
            return;
        }
        let lowercase = rows[0].name.toLowerCase();
        let title = "screenshare-" + lowercase;
        console.log(title);
        // Create the channels, disallowing everyone to view the channel, read the message history, and send messages.
        message.guild.channels.create(title, {
            permissionOverwrites: [
                {
                    id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
                },
                {
                    // But allow the two users to view the channel, send messages, and read the message history.
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: '882750156905275402',
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: '877309777741500487',
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ],
        });
        // Move the users to that VC.
        setTimeout(function () {
            // Get the channel ID based on the name (credit to Milo Murphy in the Top.GG Discord)
            var channelID = message.guild.channels.cache.find(c => c.name === title).id;
            const errorEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle(`Please fill out the following:`)
            .addFields(
                { name: '1. The user you want to screenshare.', value: 'Ex. Eltik' },
                { name: '2. What hacks they are using.', value: 'Ex. Velo/velocity, kb modifier, reach, etc.' },
                { name: '3. A screenshot of asking the user to not log.', value: 'The image does not have to be cropped. Just a normal screenshot is fine.' },
            )
            .setTimestamp()
            // Send the embd.
            message.guild.channels.cache.get(channelID).send({ embeds: [errorEmbed] });
        }, 2000);
    })
}

// Get the UUID of the user from the Mojang API.
function getUUID(username, message) {
    let uuidURL = "https://api.mojang.com/users/profiles/minecraft/" + username;
    return fetch(uuidURL)
        .then(res => res.json())
        .then(data => data.id)
        .catch(error => message.reply("Not a valid user!"));
}

// Get the username of the user from the Mojang API.
function getUsername(username, message) {
    let uuidURL = "https://api.mojang.com/users/profiles/minecraft/" + username;
    return fetch(uuidURL)
        .then(res => res.json())
        .then(data => data.name)
        .catch(error => message.reply("Not a valid user!"));
}

// Get the Discord tag of the user from Hypixel API.
function getDiscord(uuid, message, name) {
    (async () => {
        // Data is the UUID of the player from the JSON data.
        const data = await hypixel.player.uuid(uuid);
        // If the Discord tag is invalid or undefined...
        if (data.socialMedia === undefined || data.socialMedia.links === undefined || data.socialMedia.links.DISCORD === undefined) {
            return message.reply("That user hasn't linked their Discord!");
        } else {
            // x is the Discord tag.
            var x = data.socialMedia.links.DISCORD;

            // If x is not undefined...
            if (typeof x != 'undefined') {
                // If the tag DOES NOT match the current user's tag...
                if (message.member.user.tag != x) {
                    // Create a new embed.
                    const errorEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle('That users Discord is linked to ' + x + '!')
                        .setDescription('If this is your account...')
                        .addFields(
                            { name: '1. Click on your profile on Hypixel.', value: '[In-game]' },
                            { name: '2. Click on Social Media.', value: '[In-game]' },
                            { name: '3. Change your Discord tag to ' + message.member.user.tag + '.', value: '[In-game]' },
                        )
                        .setTimestamp()
                    // Send the embed.
                    message.channel.send({ embeds: [errorEmbed] });
                } else if (!message.guild.me.permissions.has('MANAGE_NICKNAMES')) {
                    // Doesn't usually work, but never had an issue with this unless the owner of the server tries to register.
                    return message.channel.send('I don\'t have permission to change your nickname!');
                } else {
                    // Add the "Ranked Player" role, remove the "Unranked" role, and set the user's nickname.
                    var role = message.member.guild.roles.cache.find(role => role.id === "877244655866093638");
                    var coalDiv = message.member.guild.roles.cache.find(role => role.id === "888644358671331338");
                    message.member.roles.add(role);
                    message.member.roles.add(role);
                    message.member.roles.add(coalDiv);
                    message.member.roles.add(coalDiv);
                    console.log("Added the role to the user.");
                    message.member.roles.remove("878277437962739713");

                    message.member.setNickname('[1000] ' + name);

                    // Insert the user into the database.
                    insertUser(message, message.member.id, name);
                }
            } else {
                // User's Discord is not set.
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('That users Discord is not set!')
                    .setDescription('If this is your account...')
                    .addFields(
                        { name: '1. Click on your profile on Hypixel.', value: '[In-game]' },
                        { name: '2. Click on Social Media.', value: '[In-game]' },
                        { name: '3. Change your Discord tag to ' + message.member.user.tag + '.', value: '[In-game]' },
                        { name: '**Register in-game on Hypixel. Not on the forums.**', value: 'Many people have trouble registering because of this.' },
                    )
                    .setTimestamp()
                // Send the embed.
                message.channel.send({ embeds: [notSetEmbed] });
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
            return message.reply("That user hasn't linked their Discord!");
        } else {
            var x = data.socialMedia.links.DISCORD;

            if (typeof x != 'undefined') {
                if (message.member.user.tag != x) {
                    // Create a new embed.
                    const errorEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle('That users Discord is linked to ' + x + '!')
                        .setDescription('If this is your account...')
                        .addFields(
                            { name: '1. Click on your profile on Hypixel.', value: '[In-game]' },
                            { name: '2. Click on Social Media.', value: '[In-game]' },
                            { name: '3. Change your Discord tag to ' + message.member.user.tag + '.', value: '[In-game]' },
                        )
                        .setTimestamp()
                    // Send the embd.
                    message.channel.send({ embeds: [errorEmbed] });
                } else if (!message.guild.me.permissions.has('MANAGE_NICKNAMES')) {
                    return message.channel.send('I don\'t have permission to change your nickname!');
                } else {
                    // Update the user.
                    con.query(`SELECT * FROM rbridge WHERE id = ?`, [message.member.user.id], function(err, rows, fields) {
                        if (err) throw err;

                        let sql;

                        if (rows.length < 1) {
                            // Create a new embed.
                            const registeredEmbed = new Discord.MessageEmbed()
                            .setColor('#10D365')
                            .setTitle('You don\'t have an account registered!')
                            .setTimestamp()
                            // Send the embd.
                            message.channel.send({ embeds: [registeredEmbed] });
                            return;
                        } else {
                            sql = `UPDATE rbridge SET name = '${name}' WHERE id='${message.member.user.id}'`;
                            con.query(`SELECT * FROM rbridge WHERE name = ?`, [name], function(erre, rowes, fields) {
                                if (erre) throw erre;
                                if (rowes.length < 1) {
                                    message.reply("You're not in the database! Please try again and/or contact Eltik.");
                                    return;
                                }
                                let p1 = rowes[0].elo;
                                message.member.setNickname('[' + p1 + '] ' + name);
                            });
                        }
                        con.query(sql);
                    })
                    // Create a new embed.
                    const registeredEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle('Renamed as ' + name + '.')
                        .setTimestamp()
                    // Send the embd.
                    message.channel.send({ embeds: [registeredEmbed] });
                }
            } else {
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('That users Discord is not set!')
                    .setDescription('If this is your account...')
                    .addFields(
                        { name: '1. Click on your profile on Hypixel.', value: '[In-game]' },
                        { name: '2. Click on Social Media.', value: '[In-game]' },
                        { name: '3. Change your Discord tag to ' + message.member.user.tag + '.', value: '[In-game]' },
                    )
                    .setTimestamp()
                // Send the embd.
                message.channel.send({ embeds: [notSetEmbed] });
            }
        }
    })();
}

// Score the game. Update the table.
function scoreElo(message, id, elo) {
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
          var coal = message.member.guild.roles.cache.find(role => role.id === "888644358671331338");
          var iron = message.member.guild.roles.cache.find(role => role.id === "888645414511853588");
          var gold = message.member.guild.roles.cache.find(role => role.id === "888645512910225459");
          var diamond = message.member.guild.roles.cache.find(role => role.id === "888646480750059570");
          var user = message.guild.members.cache.get(id);
          if (!user) {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
          }
          if (elo < 1101 && elo > 1001) {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
            user.roles.remove("888645414511853588");
              user.roles.add(coal);

              user.roles.remove(diamond);
              user.roles.remove(gold);
          } else if (elo < 1201 && elo > 1101) {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "IRON" WHERE id='${id}'`;
            user.roles.add(iron);
            user.roles.remove("888644358671331338");
            user.roles.remove(gold);
            user.roles.remove(coal);
          } else if (elo < 1301 && elo > 1201) {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "GOLD" WHERE id='${id}'`;
            user.roles.add(gold);
            user.roles.remove(iron);
            user.roles.remove(diamond);
            user.roles.remove(coal);
          } else if (elo < 1401 && elo > 1301) {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "DIAMOND" WHERE id='${id}'`;
            user.roles.add(diamond);
              user.roles.remove("888645512910225459");

              user.roles.remove(gold);
              user.roles.remove(coal);
          } else if (elo < 1000) {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
              user.roles.remove("888645414511853588");

              user.roles.remove(diamond);
              user.roles.remove(gold);
            user.roles.add(coal);
          } else {
            sql = `UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`;
          }
          con.query(sql);
        }
    })
}

function setElo(message, name, elo) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            message.reply("Coudn't find `" + name + "` in the database!");
            return;
        } else {
            sql = `UPDATE rbridge SET elo = ${elo} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Set ' + name + "'s ELO to " + elo + ".")
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    })
}

function setWins(message, name, wins) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            message.reply("Coudn't find `" + name + "` in the database!");
            return;
        } else {
            sql = `UPDATE rbridge SET wins = ${wins} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Set ' + name + "'s wins to " + wins + ".")
                .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    })
}

function setLosses(message, name, losses) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            message.reply("Coudn't find `" + name + "` in the database!");
            return;
        } else {
            sql = `UPDATE rbridge SET losses = ${losses} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Set ' + name + "'s losses to " + losses + ".")
                .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    })
}

function setWinstreak(message, name, winstreak) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            message.reply("Coudn't find `" + name + "` in the database!");
            return;
        } else {
            sql = `UPDATE rbridge SET winstreak = ${winstreak} WHERE name='${name}'`;
            con.query(sql);
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Set ' + name + "'s winstreak to " + winstreak + ".")
                .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [helpEmbed] });
        }
    })
}

function strike(message, name) {
    con.query(`SELECT * FROM punishments WHERE name = '${name}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
          if (rowes.length < 1) {
            message.reply("Couldn't find `" + name + "` in the database!");
            return;
          }
          if (rows.length < 1 && rowes.length >= 1) {
              sql = `INSERT INTO punishments (name, strikes) VALUES ('${name}', '0')`;
              console.log("Inserting " + name + " into punishments...");
              con.query(sql);
              sql = `UPDATE punishments SET strikes = '1' WHERE name='${name}'`;
              con.query(sql);
              const helpEmbed = new Discord.MessageEmbed()
                  .setColor('#10D365')
                  .setTitle(name + ' has been struck!')
                  .setTimestamp()
              // Send the embd.
              message.channel.send({ embeds: [helpEmbed] });
          } else {
              let strikes = parseInt(rows[0].strikes);
              if (strikes > 3) {
                  banUser(message, rows[0].name, "14d");
                  return;
              } else {
                  sql = `UPDATE punishments SET strikes = ${strikes += 1} WHERE name='${name}'`;
                  con.query(sql);
                  let testStrike = strikes++;
                  const strikeEmbed = new Discord.MessageEmbed()
                      .setColor('#10D365')
                      .setTitle(rows[0].name + ' has been struck!')
                      .setDescription('Current strikes: `' + testStrike + '`')
                      .setTimestamp()
                  // Send the embd.
                  message.guild.channels.cache.get("888838822710894592").send({ embeds: [strikeEmbed] });
              }
          }
        })
    })
}
function muteUser(message, name, time) {
    var role = message.member.guild.roles.cache.find(role => role.id === "884127293776216124");
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
      if (rowes.length < 1) {
        message.reply("Couldn't find `" + name + "` in the database!");
        return;
      } else {
        var mention = message.guild.members.cache.get(rowes[0].id);
        // If there isn't an user mentioned...
        if (!mention) {
            message.reply("Please provide a valid user!");
        } else {
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
            message.reply("[BUG] You can't mute someone for more than 24 days. Ask Eltik about this.");
          } else {
            if (timeFormat != undefined && typeof timeFormat != "undefined") {
                if (timeFormat === "d") {
                    mention.roles.add(role);
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle(rowes[0].name + ' is muted.')
                        .setDescription("Time: `" + time + "` days.")
                        .setTimestamp()
                    // Send the embed.
                    message.guild.channels.cache.get("888838822710894592").send({ embeds: [notSetEmbed] });
                    setTimeout(function () {
                      unmuteUser(message, rowes[0].name);
                    }, numTime * 86400000);
                } else if (timeFormat === "m") {
                    mention.roles.add(role);
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle(rowes[0].name + ' is muted.')
                        .setDescription("Time: `" + time + "` minutes.")
                        .setTimestamp()
                    // Send the embed.
                    message.guild.channels.cache.get("888838822710894592").send({ embeds: [notSetEmbed] });
                    setTimeout(function () {
                      unmuteUser(message, rowes[0].name);
                    }, numTime * 60000);
                } else if (timeFormat === "s") {
                    mention.roles.add(role);
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle(rowes[0].name + ' is muted.')
                        .setDescription("Time: `" + time + "` seconds.")
                        .setTimestamp()
                    // Send the embed.
                    message.guild.channels.cache.get("888838822710894592").send({ embeds: [notSetEmbed] });
                    setTimeout(function () {
                      unmuteUser(message, rowes[0].name);
                    }, numTime * 1000);
                } else {
                    message.reply("Please provide a valid time. Ex. `d` is days, `m` is minutes, `s` is seconds. Ex command: `=mute Eltik 10s`.");
                }
            } else {
              message.reply("You need to provide a valid time! Ex. `=mute Eltik 10d` or `=mute Eltik 10m`.");
            }
          }
        }
      }
    })
}

function banUser(message, name, time) {
    var role = message.member.guild.roles.cache.find(role => role.id === "888863827830136922");
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
      if (rowes.length < 1) {
        message.reply("Couldn't find `" + name + "` in the database!");
        return;
      } else {
        var mention = message.guild.members.cache.get(rowes[0].id);
        // If there isn't an user mentioned...
        if (!mention) {
            message.reply("Please provide a valid user!");
        } else {
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
            message.reply("[BUG] You can't ban someone for more than 24 days. Ask Eltik about this.");
          } else {
            if (timeFormat != undefined && typeof timeFormat != "undefined") {
                if (timeFormat === "d") {
                    mention.roles.add(role);
                    mention.roles.remove("877244655866093638");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle(rowes[0].name + ' is banned.')
                        .setDescription("Time: `" + time + "` days.")
                        .setTimestamp()
                    // Send the embed.
                    message.guild.channels.cache.get("884139217737879572").send({ embeds: [notSetEmbed] });
                    setTimeout(function () {
                      unbanUser(message, rowes[0].name);
                    }, numTime * 86400000);
                } else if (timeFormat === "m") {
                    mention.roles.add(role);
                    mention.roles.remove("877244655866093638");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle(rowes[0].name + ' is banned.')
                        .setDescription("Time: `" + time + "` minutes.")
                        .setTimestamp()
                    // Send the embed.
                    message.guild.channels.cache.get("884139217737879572").send({ embeds: [notSetEmbed] });
                    setTimeout(function () {
                      unbanUser(message, rowes[0].name);
                    }, numTime * 60000);
                } else if (timeFormat === "s") {
                    mention.roles.add(role);
                    mention.roles.remove("877244655866093638");
                    const notSetEmbed = new Discord.MessageEmbed()
                        .setColor('#10D365')
                        .setTitle(rowes[0].name + ' is banned.')
                        .setDescription("Time: `" + time + "` seconds.")
                        .setTimestamp()
                    // Send the embed.
                    message.guild.channels.cache.get("884139217737879572").send({ embeds: [notSetEmbed] });
                    setTimeout(function () {
                      unbanUser(message, rowes[0].name);
                    }, numTime * 1000);
                } else {
                    message.reply("Please provide a valid time. Ex. `d` is days, `m` is minutes, `s` is seconds. Ex command: `=ban Eltik 10s`.");
                }
            } else {
              message.reply("You need to provide a valid time! Ex. `=ban Eltik 10d` or `=ban Eltik 10m`.");
            }
          }
        }
      }
    })
}

function unbanUser(message, name) {
  con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
    if (rowes.length < 1) {
      message.reply("Couldn't find `" + name + "` in the database!");
      return;
    } else {
      var user = message.guild.members.cache.get(rowes[0].id);
      if (!user) {
          message.reply("Couldn't get user `" + name + "` to unban them.");
      } else {
          user.roles.remove("888863827830136922");
          user.roles.add("877244655866093638");
          const notSetEmbed = new Discord.MessageEmbed()
              .setColor('#10D365')
              .setTitle(rowes[0].name + ' is now unbanned.')
              .setTimestamp()
          // Send the embed.
          message.guild.channels.cache.get("884139217737879572").send({ embeds: [notSetEmbed] });
      }
    }
  })
}

function unmuteUser(message, name) {
    con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rowes) => {
      if (rowes.length < 1) {
        message.reply("Couldn't find `" + name + "` in the database!");
        return;
      } else {
        var user = message.guild.members.cache.get(rowes[0].id);
        if (!user) {
            message.reply("Couldn't get user `" + name + "` to unmute them.");
        } else {
            user.roles.remove("884127293776216124");
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle(rowes[0].name + ' is now unmuted.')
                .setTimestamp()
            // Send the embed.
            message.guild.channels.cache.get("888838822710894592").send({ embeds: [notSetEmbed] });
        }
      }
    })
  }

// Insert the user into the database.
function insertUser(message, id, name) {
    // The "Ranked Player" role (I think)
    var role = message.member.guild.roles.cache.find(role => role.id === "877244655866093638");
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        let sql;

        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo, name) VALUES ('${id}', '1000', '${name}')`;
            console.log("Inserting " + id + "...");
            con.query(sql);
            // Create a new embed.
            const registeredEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Registered as ' + name + '.')
                .setTimestamp()
            // Send the embed.
            message.channel.send({ embeds: [registeredEmbed] });
        } else {
            // Add the role and set the nickname.
            message.member.roles.add(role);
            message.member.roles.remove("878277437962739713");
            message.member.setNickname('[' + rows[0].elo + '] ' + name);
            message.reply("You're already registered!");
        }
    })
}

// Set the user's nickname based on their ELO.
function setName(message, id, elo) {
    con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            console.log("Couldn't get user " + id + ".");
            return;
        }
        let guild = client.guilds.cache.get(id);
        message.guild.members.fetch(id).then(user => user.setNickname('[' + elo + '] ' + rows[0].name));
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
    con.query(`SELECT * FROM rbridge WHERE name = ?`, [name], function(err, rows, fields) {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const registeredEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('That user doesn\'t exist!')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [registeredEmbed] });
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
            wl = "∞";
        } else {
            // Round the w/l to the nearest tenth or hundredth.
            wl = (wins / losses).toFixed(2);
        }
        let winstreak = rows[0].winstreak;
        let bestWinstreak = rows[0].bestws;
        getUUID(name, message).then(id => {
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Stats of ' + namee)
                .setDescription('Ranked Bridge')
                .addFields(
                    { name: 'ELO:', value: elo + ' ELO' },
                    { name: 'Division:', value: division + ' Division' },
                    { name: 'Games played:', value: gamesPlayed + ' games' },
                    { name: 'Wins:', value: wins + ' wins' },
                    { name: 'Losses:', value: losses + ' losses' },
                    { name: 'Win/Loss:', value: wl + ' w/l' },
                    { name: 'Best Winstreak:', value: bestWinstreak + ' winstreak' },
                    { name: 'Current Winstreak:', value: winstreak + ' winstreak' },
                )
                .setThumbnail("https://mc-heads.net/player/" + id)
                .setTimestamp()
            // Send the embed.
            message.channel.send({ embeds: [notSetEmbed] });
        })
    });
}

// Get the stats of an user based on their ID (hence why it's "mention")
function getStatsMention(message, id) {
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id.id], function (err, rows, fields) {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const registeredEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('That user doesn\'t exist!')
            .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [registeredEmbed] });
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
            wl = "∞";
        } else {
            // Round the w/l to the nearest tenth or hundredth.
            wl = Math.round((wins / losses + Number.EPSILON) * 100) / 100;
        }
        let winstreak = rows[0].winstreak;
        let bestWinstreak = rows[0].bestws;

        getUUID(name, message).then(id => {
            const notSetEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('Stats of ' + name)
                .setDescription('Ranked Bridge')
                .addFields(
                    { name: 'ELO:', value: elo + ' ELO' },
                    { name: 'Division:', value: division + ' Division' },
                    { name: 'Games played:', value: gamesPlayed + ' games' },
                    { name: 'Wins:', value: wins + ' wins' },
                    { name: 'Losses:', value: losses + ' losses' },
                    { name: 'Win/Loss:', value: wl + ' w/l' },
                    { name: 'Best Winstreak:', value: bestWinstreak + ' winstreak' },
                    { name: 'Current Winstreak:', value: winstreak + ' winstreak' },
                )
                .setThumbnail("https://mc-heads.net/player/" + id)
                .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [notSetEmbed] });
        })
    });
}

// Get the ELO of an user based on a mention. Doesn't seem to be used right now (can probably delete)
function getEloMention(message, mention) {
    con.query(`SELECT * FROM rbridge WHERE id = '${mention.id}'`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            // Create a new embed.
            const registeredEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('That user doesn\'t exist!')
            .setTimestamp()
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
            const registeredEmbed = new Discord.MessageEmbed()
                .setColor('#10D365')
                .setTitle('There was an error getting the leaderboard! Ping Eltik.')
                .setTimestamp()
            // Send the embd.
            message.channel.send({ embeds: [registeredEmbed] });
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != 'undefined' && typeof names != 'undefined') {
                elo.push(parseInt(rows[i].elo));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('ELO Leaderboard')
            .addFields(
                { name: 'Leaderboard:', value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\``},
                )
            .setTimestamp()
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function getWinsLeaderboard(message) {
    con.query(`SELECT * FROM rbridge ORDER BY wins DESC LIMIT 10`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            message.reply("That user doesn't exist!");
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != 'undefined' && typeof names != 'undefined') {
                elo.push(parseInt(rows[i].wins));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Wins Leaderboard')
            .addFields(
                { name: 'Leaderboard:', value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\`` },
            )
            .setTimestamp()
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function getLossesLeaderboard(message) {
    con.query(`SELECT * FROM rbridge ORDER BY losses DESC LIMIT 10`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            message.reply("That user doesn't exist!");
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != 'undefined' && typeof names != 'undefined') {
                elo.push(parseInt(rows[i].losses));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Losses Leaderboard')
            .addFields(
                { name: 'Leaderboard:', value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\`` },
            )
            .setTimestamp()
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function getWinstreakLeaderboard(message) {
    con.query(`SELECT * FROM rbridge ORDER BY bestws DESC LIMIT 10`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            message.reply("That user doesn't exist!");
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != 'undefined' && typeof names != 'undefined') {
                elo.push(parseInt(rows[i].bestws));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Winstreak Leaderboard')
            .addFields(
                { name: 'Leaderboard:', value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\`` },
            )
            .setTimestamp()
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function getGamesLeaderboard(message) {
    con.query(`SELECT * FROM rbridge ORDER BY games DESC LIMIT 10`, (err, rows) => {
        if (err) throw err;

        if (!rows[0]) {
            message.reply("That user doesn't exist!");
            return;
        }

        let elo = [];
        let names = [];
        for (var i = 0; i < rows.length; i++) {
            if (typeof rows[i] != 'undefined' && typeof names != 'undefined') {
                elo.push(parseInt(rows[i].games));
                names.push(rows[i].name);
            }
        }
        const notSetEmbed = new Discord.MessageEmbed()
            .setColor('#10D365')
            .setTitle('Games Leaderboard')
            .addFields(
                { name: 'Leaderboard:', value: `\`\`\`#1. ${names[0]}: ${elo[0]}\n#2. ${names[1]}: ${elo[1]}\n#3. ${names[2]}: ${elo[2]}\n#4. ${names[3]}: ${elo[3]}\n#5. ${names[4]}: ${elo[4]}\n#6. ${names[5]}: ${elo[5]}\n#7. ${names[6]}: ${elo[6]}\n#8. ${names[7]}: ${elo[7]}\n#9. ${names[8]}: ${elo[8]}\n#10. ${names[9]}: ${elo[9]}\n\`\`\`` },
            )
            .setTimestamp()
        // Send the embd.
        message.channel.send({ embeds: [notSetEmbed] });
    });
}

function calcElo(message, id, id2) {
    console.log("Scoring game for " + id + " and " + id2 + ".");
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], function (err, rowe, fields) {
        if (rowe.length < 1) {
            console.log("Couldn't get the data for `" + id + "`! Try again.");
            return;
        }
        var winnerName = rowe[0].name;
        let p1 = rowe[0].elo;
        con.query(`SELECT * FROM rbridge WHERE id = ?`, [id2], function(err, rowes, fields) {
            if (rowes.length < 1) {
                message.reply("Couldn't get the data for " + id2 + " Try again.");
                return;
            }
            var loserName = rowes[0].name;
            let p2 = rowes[0].elo;

            var p1_expected = elo.getExpected(p1, p2);
            var p2_expected = elo.getExpected(p2, p1);

            var p1_elo = elo.updateRating(p1_expected, 1, p1);
            var p2_elo = elo.updateRating(p2_expected, 0, p2);

            var round1 = Math.round(p1_elo);
            var round2 = Math.round(p2_elo);

            var eloChange = round1 - p1;
            var negChange = p2 - round2;

            setName(message, id, round1);
            setName(message, id2, round2);

            scoreElo(message, id, round1);
            scoreElo(message, id2, round2);

            console.log("Scored game for " + winnerName + " and " + loserName + ".");
            console.log(winnerName + "'s ELO: " + round1);
            console.log(loserName + "'s ELO: " + round2);

            win(id);
            lose(id2);
            winStreak(id);
            loseStreak(id2);
            gamesPlayed(id);
            gamesPlayed(id2);

            let sql;
            console.log("Inserting game...");
            con.query("select count(*) as \"count\" from games", (erres, rowess) => {
                if (erres) throw erres;
                let gameee = parseInt(rowess[0].count);
                let gameNum = gameee++;
                sql = `INSERT INTO games (winnerid, loserid, winnerelo, loserelo, gameid) VALUES ('${id}', '${id2}', '${round1}', '${round2}', ${gameNum})`;
                con.query(sql, (err) => {
                    if (err) throw err;
                });
                const notSetEmbed = new Discord.MessageEmbed()
                    .setColor('#10D365')
                    .setTitle('Game ' + gameNum)
                    .setDescription('Scored by ' + message.author.tag)
                    .addFields(
                        { name: 'Winner: ' + winnerName, value: 'ELO change: ' + p1 + " > " + round1 + ". +" + eloChange },
                        { name: 'Loser: ' + loserName, value: 'ELO change: ' + p2 + " > " + round2 + ". -" + negChange },
                    )
                    .setTimestamp()
                message.guild.channels.cache.get("883834087125700659").send({ embeds: [notSetEmbed] })
                console.log("Done! Scored game " + gameNum + ".");
            });
        });
    });
}

function win(id) {
    con.query(`SELECT wins FROM rbridge WHERE id = ?`, [id], function(err, rows, fields) {
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
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], function(err, rows, fields) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            console.log("Couldn't find " + id + " in the database!");
        } else {
            let games = rows[0].games;
            let updateGames = games += 1;
            sql = `UPDATE rbridge SET games = ${updateGames} WHERE id='${id}'`;
        }

        con.query(sql);
    });
}

function winStreak(id) {
    con.query(`SELECT * FROM rbridge WHERE id = ?`, [id], function(err, rows, fields) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            sql = `UPDATE rbridge SET winstreak	 = ${rows[0].winstreak + 1} WHERE id='${id}'`;
            if (rows[0].winstreak + 1 > rows[0].bestws) {
                console.log("Current winstreak for " + rows[0].name + " is better than their best winstreak of " + rows[0].bestws + ".");
                console.log("Updating best winstreak...");
                updateBestWs(id, rows[0].winstreak + 1);
            }
            con.query(sql);
        }
    });
}

function updateBestWs(id, ws) {
    con.query(`UPDATE rbridge SET bestws = ${ws} WHERE id='${id}'`, (err, rows) => {
        if (err) throw err;
        console.log("Updated best winstreak.");
    })
}

function loseStreak(id) {
    con.query(`SELECT winstreak FROM rbridge WHERE id = ?`, [id], function(err, rows, fields) {
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
    con.query(`SELECT losses FROM rbridge WHERE id = ?`, [id], function(err, rows, fields) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO rbridge (id, elo) VALUES ('${id}', '1000')`;
        } else {
            sql = `UPDATE rbridge SET losses = ${rows[0].losses + 1} WHERE id='${id}'`;
        }

        con.query(sql);
    });
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

function scoreFile(message) {
    var fs = require('fs');
    var util = require('util');
    var logFile = fs.createWriteStream('score.txt', { flags: 'a' });
    var logStdout = process.stdout;

    logFile.write(util.format(message) + '\n');
    logStdout.write(util.format(message) + '\n');
}

function purge(message, name) {
    con.query(`SELECT * FROM rbridge WHERE name = ?`, [name], function(err, rows, fields) {
        if (err) throw err;

        let sql;
        if (rows.length < 1) {
            message.reply("Can't find `" + name + "` in the database.");
        } else {
            sql = `DELETE FROM rbridge WHERE name = '${name}'`;
            var user = message.guild.members.cache.get(rows[0].id);
            var role = message.member.guild.roles.cache.find(role => role.id === "878277437962739713");
            user.roles.add(role);
            user.roles.remove("885269051125932113");
            user.roles.add(role);
            user.roles.remove("885269051125932113");
            message.reply("Purged `" + name + "`.");
        }

        con.query(sql);
    });
}

client.login(token);
