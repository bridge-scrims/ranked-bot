const gameFunctions = require("../../handlers/game/gameFunctions.js");

module.exports = client => {
    client.user.setActivity('Ranked Bridge', { type: "WATCHING" });
    // When the client loads...
    gameFunctions.setGames();
    console.log(`Logged in as ${client.user.tag}!`.rainbow);
};