const mysql = require("mysql");

let variables = require("../../handlers/variables.js");
const roles = require("../../config/roles.json");
const config = require("../../config/config.json");

const Discord = require("discord.js");

let con = mysql.createPool({
    connectionLimit: 100,
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    debug: false
});

module.exports.getELO = getELO;
module.exports.makeChannel = makeChannel;
module.exports.getGames = getGames;
module.exports.setGames = setGames;

function getELO(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows[0]) {
                resolve(null);
            }
    
            resolve(rows[0].elo);
        });
    });
}

async function makeChannel(message, id, id2) {
    await message.guild.members.fetch(id).then(async (user) => {
        await message.guild.members.fetch(id2).then(async (user2) => {
            console.log("Starting a game for ".yellow + user.user.tag + " and ".yellow + user2.user.tag + "...".yellow);
            variables.games.push(getGames());
            const gameId = variables.games.length;

            await message.guild.channels.create("game-" + gameId, {
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                        deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] //Deny permissions
                    },
                    {
                        // But allow the two users to view the channel, send messages, and read the message history.
                        id: id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    },
                    {
                        id: id2,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    },
                    {
                        id: roles.staff,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    },
                    {
                        id: roles.scorer,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    }
                ],
            });

            await message.guild.channels.create("Game " + gameId + " Team 1", {
                type: 2,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                        deny: ['Connect', 'Speak'] //Deny permissions
                    },
                    {
                        id: id,
                        allow: ['ViewChannel', 'Connect', 'Speak']
                    },
                    {
                        id: id2,
                        allow: ['ViewChannel']
                    },
                   
                    {
                        id: roles.staff,
                        allow: ['ViewChannel', 'Connect', 'Speak']
                    },
                    {
                        id: roles.scorer,
                        allow: ['ViewChannel', 'Connect', 'Speak']
                    }
                ],
            });

            await message.guild.channels.create("Game " + gameId + " Team 2", {
                type: 2,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                        deny: ['Connect', 'Speak'] //Deny permissions
                    },
                    {
                        id: id,
                        allow: ['ViewChannel']
                    },
                    {
                        id: id2,
                        allow: ['ViewChannel', 'Connect', 'Speak']
                    },
                   
                    {
                        id: roles.staff,
                        allow: ['ViewChannel', 'Connect', 'Speak']
                    },
                    {
                        id: roles.scorer,
                        allow: ['ViewChannel', 'Connect', 'Speak']
                    }
                ],
            });

            var vc1 = message.guild.channels.cache.find(c => c.name === "Game " + gameId + " Team 1");
            var vc2 = message.guild.channels.cache.find(c => c.name === "Game " + gameId + " Team 2");

            if (!vc1) {
                console.log("Can't get VC 1!".red);
            }
            if (!vc2) {
                console.log("Can't get VC 2!".red);
            }

            let team1 = vc1.id;
            let team2 = vc2.id;

            var textChannel = message.guild.channels.cache.find(c => c.name === "game-" + gameId);
            if (!textChannel) {
                console.log("Can't get the message channel!".red);
            }

            let messageChannel = textChannel.id;

            // Send the embed.
            const channelEmbed = new Discord.EmbedBuilder()
                .setColor('#36699c')
                .setTitle(`Game #${gameId}`)
                .setDescription('Duel the other person using `/duel <user> bridge`. Once the game is done, send a screenshot of the score using `/score`. Remember, games are best of 1.')
                .setTimestamp()
            message.guild.channels.cache.get(messageChannel).send({ content: "<@" + id + "> <@" + id2 + ">", embeds: [channelEmbed] });

            variables.curGames.push([id, messageChannel]);
            variables.curGames.push([id2, messageChannel]);

            await user.voice.setChannel(team1).catch((err) => console.error(err));
            await user2.voice.setChannel(team2).catch((err) => console.error(err));

            let invis1 = await message.guild.channels.cache.find((name) => name.name === id);
            let invis2 = await message.guild.channels.cache.find((name) => name.name === id2);
            if (invis1 != undefined) {
                invis1.delete().catch((err) => console.error(err));
            }
        
            if (invis2 != undefined) {
                invis2.delete().catch((err) => console.error(err));
            }
            console.log("Game ".green + "#" + gameId + " has been started.".green);
        });
    });
}

function setGames() {
    con.query(`SELECT * FROM games`, (err, rows) => {
        if (err) throw err;
        for (let i = 0; i < rows.length; i++) {
            variables.games.push(rows[i].gameid);
        }
    });
}

function getGames() {
    con.query(`SELECT * FROM games`, (err, rows) => {
        if (err) throw err;
        return rows.length;
    });
}