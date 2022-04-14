const Discord = require("discord.js");
const config = require("./config/config.json");
const fs = require("fs");

const colors = require("colors");

const commands = [];

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
        status: "dnd"
    }
});

let amount = 0;
["loadEvents", config.antiCrash ? "antiCrash" : null]
    .filter(Boolean)
    .forEach(h => {
        require(`./handlers/${h}.js`)(client);
        amount++;
    })
console.log(amount + ` handlers loaded!`.dim.green);

client.commands = new Discord.Collection();

// Command handler
const commandFiles = fs.readdirSync('./handlers/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const commandName = file.split(".")[0];
    const command = require(`./handlers/commands/${file}`);

    commands.push(commandName);

    client.commands.set(commandName, command);
}

console.log(commands.length + ` commands loaded!`.dim.green);

client.login(config.token);

// HUGE CREDIT TO NITEBLOCK AND TOFAA FOR A LOT OF THE EVENTS CODE.
// I couldn't have made the bot without seeing their code.