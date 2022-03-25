const functions = require("../../handlers/functions");

module.exports = (client, id, replayedEvents) => {
    console.log(`[${String(new Date).split(" ", 5).join(" ")}] - ` + `Shard`.green + `#${id} ` + `Resumed`.green);
}