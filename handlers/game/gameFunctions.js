const mysql = require("mysql");

let variables = require("../../handlers/variables.js");
const roles = require("../../config/roles.json");
const config = require("../../config/config.json");
const functions = require("../functions.js");

const Discord = require("discord.js");

const axios = require("axios");

const glicko2 = require("glicko2");
var settings = {
    // tau : "Reasonable choices are between 0.3 and 1.2, though the system should
    //      be tested to decide which value results in greatest predictive accuracy."
    tau: 0.9,
    // rating : default rating
    rating: 1000,
    //rd : Default rating deviation
    //     small number = good confidence on the rating accuracy. Like kFactor
    rd: 16 * 4.69,
    //vol : Default volatility (expected fluctation on the player rating)
    vol: 0.06
};
var ranking = new glicko2.Glicko2(settings);

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

module.exports.calcElo = calcElo;
module.exports.updateELO = updateELO;

module.exports.getName = getName;

module.exports.getRole = getRole;
module.exports.getUser = getUser;

module.exports.fixRoles = fixRoles;
module.exports.fixName = fixName;

module.exports.getWins = getWins;
module.exports.getLosses = getLosses;
module.exports.getWinstreak = getWinstreak;
module.exports.getBestWinstreak = getBestWinstreak;
module.exports.getStats = getStats;

module.exports.setWins = setWins;
module.exports.setLosses = setLosses;
module.exports.setWinstreak = setWinstreak;
module.exports.setBestwinstreak = setBestwinstreak;
module.exports.updateDivision = updateDivision;

module.exports.getTotalGames = getTotalGames;
module.exports.insertGame = insertGame;
module.exports.setGame = setGame;

module.exports.isInDb = isInDb;
module.exports.nameInDb = nameInDb;
module.exports.insertUser = insertUser;

module.exports.getUUID = getUUID;
module.exports.getHypixel = getHypixel;

async function insertUser(id, name) {
    return new Promise(async function (resolve, reject) {
        let isName = await nameInDb(name);
        if (!isName) {
            con.query(`INSERT INTO rbridge (id, elo, name) VALUES ('${id}', '1000', '${name}')`, (err, rows) => {
                if (err) reject(err);
                resolve(true);
            });
        } else {
            con.query(`UPDATE rbridge SET id='${id}' WHERE name='${name}'`, (err, rows) => {
                if (err) reject(err);
                resolve(true);
            });
        }
    });
}

async function getUUID(username) {
    return new Promise(async function (resolve, reject) {
        let uuidURL = "https://api.mojang.com/users/profiles/minecraft/" + username;
        axios.get(uuidURL, {
        }).then(async (res) => {
            resolve({ "name": res.data.name, "uuid": res.data.id })
        }).catch((err) => {
            reject(err);
        });
    });
}

async function getHypixel(id) {
    return new Promise(async function (resolve, reject) {
        let uuidURL = `https://api.hypixel.net/player?uuid=${id}&key=${config.apiKey}`;
        axios.get(uuidURL, {
        }).then(async (res) => {
            resolve(res.data);
        }).catch((err) => {
            reject(err);
        });
    });
}

async function isInDb(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
    
            resolve(true);
        });
    });
}

async function nameInDb(name) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE name = '${name}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
    
            resolve(true);
        });
    });
}

async function insertGame(id, id2) {
    let gameId = await getTotalGames();
    con.query(`INSERT INTO games (winnerid, loserid, winnerelo, loserelo, gameid) VALUES ('${id}', '${id2}', 0, 0, ${gameId})`, (err) => {
        if (err) throw err;
    });
}

async function setGame(id, id2, elo, elo2, gameId) {
    sql = `UPDATE games SET winnerid='${id}' WHERE gameid=${gameId}`;
    con.query(sql, (err) => {
        if (err) throw err;
    });
    sql = `UPDATE games SET loserid='${id2}' WHERE gameid=${gameId}`;
    con.query(sql, (err) => {
        if (err) throw err;
    });

    sql = `UPDATE games SET winnerelo=${elo} WHERE gameid=${gameId}`;
    con.query(sql, (err) => {
        if (err) throw err;
    });
    sql = `UPDATE games SET loserelo=${elo2} WHERE gameid=${gameId}`;
    con.query(sql, (err) => {
        if (err) throw err;
    });
}

function getTotalGames() {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM games`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[rows.length - 1].gameid);
        });
    });
}

async function updateELO(id, elo) {
    con.query(`UPDATE rbridge SET elo = ${elo}, division = "COAL" WHERE id='${id}'`, (err, rows) => {
        if (err) return console.error(err);
    });
}

async function updateDivision(id) {
    let sql;
    if (elo <= 999) {
        sql = `UPDATE rbridge SET division = "COAL" WHERE id='${id}'`;
    } else if (elo < 1100 && elo >= 1000) {
        sql = `UPDATE rbridge SET division = "IRON" WHERE id='${id}'`;
    } else if (elo < 1200 && elo >= 1100) {
        sql = `UPDATE rbridge SET division = "GOLD" WHERE id='${id}'`;
    } else if (elo < 1400 && elo >= 1200) {
        sql = `UPDATE rbridge SET division = "DIAMOND" WHERE id='${id}'`;
    } else if (elo < 1600 && elo >= 1400) {
        sql = `UPDATE rbridge SET division = "EMERALD" WHERE id='${id}'`;
    } else if (elo < 1800 && elo >= 1600) {
        sql = `UPDATE rbridge SET division = "OBSIDIAN" WHERE id='${id}'`;
    } else if (elo >= 1800) {
        sql = `UPDATE rbridge SET division = "CRYSTAL" WHERE id='${id}'`;
    } else if (elo < 1000) {
        sql = `UPDATE rbridge SET division = "COAL" WHERE id='${id}'`;
    }
    con.query(sql);
}

async function fixRoles(interaction, id) {
    let elo = await getELO(id);
    let user = await getUser(interaction.guild, id);

    let coal = await getRole(interaction.guild, roles.coalDivision);
    let iron = await getRole(interaction.guild, roles.ironDivision);
    let gold = await getRole(interaction.guild, roles.goldDivision);
    let diamond = await getRole(interaction.guild, roles.diamondDivision);
    let emerald = await getRole(interaction.guild, roles.emeraldDivision);
    let obsidian = await getRole(interaction.guild, roles.obsidianDivision);
    let crystal = await getRole(interaction.guild, roles.crystalDivision);

    if (!user || !user.roles) {
        return;
    }
    if (elo <= 999) {
        user.roles.add(coal);
        user.roles.remove(iron);
        user.roles.remove(obsidian);
        user.roles.remove(diamond);
        user.roles.remove(gold);
        user.roles.remove(emerald);
        user.roles.remove(crystal);
    } else if (elo < 1100 && elo >= 1000) {
        user.roles.add(iron);
        user.roles.remove(diamond);
        user.roles.remove(obsidian);
        user.roles.remove(gold);
        user.roles.remove(coal);
        user.roles.remove(emerald);
        user.roles.remove(crystal);
    } else if (elo < 1200 && elo >= 1100) {
        user.roles.add(gold);
        user.roles.remove(iron);
        user.roles.remove(diamond);
        user.roles.remove(coal);
        user.roles.remove(obsidian);
        user.roles.remove(emerald);
        user.roles.remove(crystal);
    } else if (elo < 1400 && elo >= 1200) {
        user.roles.add(diamond);
        user.roles.remove(obsidian);
        user.roles.remove(gold);
        user.roles.remove(coal);
        user.roles.remove(emerald);
        user.roles.remove(crystal);
    } else if (elo < 1600 && elo >= 1400) {
        user.roles.add(emerald);
        user.roles.remove(diamond);
        user.roles.remove(gold);
        user.roles.remove(coal);
        user.roles.remove(obsidian);
        user.roles.remove(crystal);
    } else if (elo < 1800 && elo >= 1600) {
        user.roles.add(obsidian);
        user.roles.remove(diamond);
        user.roles.remove(gold);
        user.roles.remove(coal);
        user.roles.remove(emerald);
        user.roles.remove(crystal);
    } else if (elo >= 1800) {
        user.roles.add(crystal);
        user.roles.remove(diamond);
        user.roles.remove(gold);
        user.roles.remove(coal);
        user.roles.remove(obsidian);
        user.roles.remove(emerald);
    } else if (elo < 1000) {
        user.roles.remove(obsidian);
        user.roles.remove(diamond);
        user.roles.remove(gold);
        user.roles.add(coal);
        user.roles.remove(crystal);
    }
}

async function fixName(interaction, id) {
    let member = await getUser(interaction.guild, id);
    let elo = await getELO(id);
    let name = await getName(id);
    let nick = member.displayName;
    if (nick.includes("[") && !nick.includes("(")) {
        interaction.guild.members.fetch(id).then((user) => user.setNickname("[" + elo + "] " + name)).catch((err) => console.error(err));;
    } else if (nick.includes("[") && nick.includes("(")) {
        let split = nick.split(" ");
        let restNick = split[1] + " " + split[2];
        interaction.guild.members.fetch(id).then((user) => user.setNickname("[" + elo + "] " + restNick).catch((e) => console.log("Error setting the nickname!")));
    }
}

async function getUser(guild, id) {
    return new Promise(async function (resolve, reject) {
        await guild.members.fetch(id).then((user) => {
            resolve(user);
        }).catch((err) => {
            console.error(err);
            reject(err);
        });
    });
}

async function getRole(guild, id) {
    return new Promise(async function (resolve, reject) {
        await guild.roles.fetch(id).then((role) => {
            resolve(role);
        }).catch((err) => {
            console.error(err);
            reject(err);
        });
    });
}

async function calcElo(winner, loser, winnerScore, loserScore) {
    let p1 = await getELO(winner);
    let p2 = await getELO(loser);
    let p1Ranking = ranking.makePlayer(p1);
    let p2Ranking = ranking.makePlayer(p2);
    var matches = [];
    matches.push([p1Ranking, p2Ranking, 1])
    ranking.updateRatings(matches);

    var p1_elo = p1Ranking.getRating();

    var eloChange = Math.abs(p1_elo - p1);

    let change1 = Math.round(p1 + eloChange + (winnerScore / 4));
    let change2 = Math.round(p2 - eloChange + (loserScore / 2));
    return [change1, change2];
}

function getName(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[0].name);
        });
    });
}

function getELO(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[0].elo);
        });
    });
}

function getStats(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
            resolve(rows[0]);
        });
    });
}

async function getWins(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[0].wins);
        });
    });
}

async function getLosses(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[0].losses);
        });
    });
}

async function getWinstreak(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[0].winstreak);
        });
    });
}

async function getBestWinstreak(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
    
            resolve(rows[0].bestws);
        });
    });
}

async function getGames(id) {
    return new Promise(async function (resolve, reject) {
        con.query(`SELECT * FROM rbridge WHERE id = '${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(null);
            }
            resolve(rows[0].games);
        });
    });
}

async function setWins(id, wins) {
    return new Promise(async function (resolve, reject) {
        con.query(`UPDATE rbridge SET wins = ${wins} WHERE id='${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
            resolve(true);
        });
    });
}

async function setLosses(id, losses) {
    return new Promise(async function (resolve, reject) {
        con.query(`UPDATE rbridge SET losses = ${losses} WHERE id='${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
            resolve(true);
        });
    });
}

async function setWinstreak(id, winstreak) {
    return new Promise(async function (resolve, reject) {
        con.query(`UPDATE rbridge SET winstreak = ${winstreak} WHERE id='${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
            resolve(true);
        });
    });
}

async function setBestwinstreak(id, bestws) {
    return new Promise(async function (resolve, reject) {
        con.query(`UPDATE rbridge SET bestws = ${bestws} WHERE id='${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
            resolve(true);
        });
    });
}

async function setGames(id, games) {
    return new Promise(async function (resolve, reject) {
        con.query(`UPDATE rbridge SET games = ${games} WHERE id='${id}'`, (err, rows) => {
            if (err) reject(err);
            if (!rows || rows.length === 0) {
                resolve(false);
            }
            resolve(true);
        });
    });
}

async function makeChannel(message, id, id2) {
    await message.guild.members.fetch(id).then(async (user) => {
        await message.guild.members.fetch(id2).then(async (user2) => {
            console.log("Starting a game for ".yellow + user.user.tag + " and ".yellow + user2.user.tag + "...".yellow);
            variables.games.push(await getTotalGames());
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

            await insertGame(id, id2);

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