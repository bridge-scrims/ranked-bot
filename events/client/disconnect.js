const { logError } = require("../../handlers/functions")

//here the event starts
module.exports = client => {
    logError(`Bot disconnected from Discord API at ${new Date()}.`);
    console.log(`Bot has been disconnected from Discord API at ${new Date()}.`.red)
}