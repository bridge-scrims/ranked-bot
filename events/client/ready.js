const gameFunctions = require("../../handlers/game/gameFunctions.js");
const config = require("../../config/config.json");

module.exports = client => {
    client.user.setActivity('Ranked Bridge', { type: "WATCHING" });
    // When the client loads...
    gameFunctions.setGames();
    console.log(`Logged in as ${client.user.tag}!`.green);
    gameFunctions.runLoops(client.guilds.cache.get(config.guildId));
};