const functions = require("../../handlers/functions");

module.exports = (client, id) => {
    functions.logError(`[${String(new Date).split(" ", 5).join(" ")}] - Shard #${id} Reconnecting...`);
    console.log(`[${String(new Date).split(" ", 5).join(" ")}] - ` + `Shard`.yellow + `#${id} ` + `Reconnecting`.yellow);
}