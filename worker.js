const Discord = require("discord.js");
const config = require("./config/config_worker.json");
const orConfig = require("./config/config.json");
const { joinVoiceChannel } = require("@discordjs/voice");
let channels = require("./config/channels.json");
const fs = require("fs");
const colors = require("colors");

module.exports.changeNickname = changeNickname;
module.exports.moveUser = moveUser;

const client = new Discord.Client({
    shards: "auto",
    intents: [
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
    ],
    presence: {
        status: "invisible",
    }
});

async function runLoops(guild) {
    joinVoiceChannel({ channelId: channels.queueChannel, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
    setInterval(function () {
        joinVoiceChannel({ channelId: channels.queueChannel, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator });
    }, 100000);
}

client.on("ready", async client => {
    console.log(`Logged in as ${client.user.tag}!`.green);
    let guild = client.guilds.cache.get(config.guildId);
    await runLoops(guild);
})

async function changeNickname(guild, id, nickname) {
    if (id === orConfig.clientId || id === "593882880854196228") {
        console.log("Returned. Can't change nickname for this user.");
        return true;
    }
    let member = await guild.members.fetch(id).catch((err) => {
        console.log(err);
        return false;
    });
    member.setNickname(nickname);
    return true;
}

async function moveUser(guild, id, channel) {
    return new Promise((resolve, reject) => {
        if (id === orConfig.clientId || id === "593882880854196228") {
            console.log("Returned. Can't change nickname for this user.");
            return true;
        }
        guild.members.fetch(id).then((member) => {
            member.voice.setChannel(channel).then(() => {
                resolve();
            });
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    })
}

client.login(config.token);