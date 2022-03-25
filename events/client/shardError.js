const functions = require("../../handlers/functions");

module.exports = (client, error, id) => {
    functions.logError(`[${String(new Date).split(" ", 5).join(" ")}] - Shard #${id} Errored.`);
    console.log(`[${String(new Date).split(" ", 5).join(" ")}] - ` + `Shard`.red + `#${id} ` + `Errored`.red)
}