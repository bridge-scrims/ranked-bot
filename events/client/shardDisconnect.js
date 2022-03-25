const functions = require("../../handlers/functions");

module.exports = (client, event, id) => {
    functions.logError(`[${String(new Date).split(" ", 5).join(" ")}] - Shard #${id} Disconnected.`);
    console.log(`[${String(new Date).split(" ", 5).join(" ")}] - ` + `Shard`.red + `#${id} ` + `Disconnected`.red);
}