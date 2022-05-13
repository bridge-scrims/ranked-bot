const Discord = require("discord.js");

const gameFunctions = require("../game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {
    const helpEmbed = new Discord.EmbedBuilder()
        .setColor("#36699c")
        .setDescription(
        "```\n" +
        "[DEFAULT CMDS]\n" +
        "```\n" +
        "`/register <ign>`\n" +
        "> `ign`: The username to register as.\n" +
        "> Registers you to the database.\n\n" +
        "`/rename <ign>`\n" +
        "> `ign`: The username to rename your account as.\n" +
        "> Renames your account.\n\n" +
        "`/ping`\n" +
        "> Pings <@&883791592073330758>.\n\n" +
        "`/score`\n" +
        "> Creates a score request.\n\n" +
        "`/void`\n" +
        "> Creates a void request. Used to void a game.\n\n" +
        "`/party <invite | list | leave> <user>`\n" +
        "> `invite <user>`: Invites an user specified to your party.\n" +
        "> `list`: Lists all the members in your party.\n" +
        "> `leave`: Leaves and disbands your party.\n" +
        "> Party management commands. Allows you to queue with another person.\n\n" +
        "`/screenshare <user>`\n" +
        "> `user`: The user to screenshare.\n" +
        "> Opens a screenshare ticket. Only use this if you think someone is cheating.\n\n" +
        "`/report <user>`\n" +
        "> `user`: The user to report.\n" +
        "> Opens a report ticket. Only use this if someone is breaking the rules.\n\n" +
        "`/stats [user]`\n" +
        "> `user`: The user to stat check.\n" +
        "> Returns a stats card of the user specified.\n\n" +
        "`/leaderboard [ELO | Wins | Losses | Best Winstreak | Games]`\n" +
        "> Displays the leaderboard for the type specified (if none, shows the ELO leaderboard).\n\n" +
        "```\n" +
        "[BOOSTER CMDS]\n" +
        "```\n" +
        "`/call <user>`\n" +
        "> `user`: The user to call.\n" +
        "> Moves you to the game VC if the user specified is in a game.\n\n" +
        "`/nick <set | hide | reset> <nick>`\n" +
        "> `set <nick>`: Adds a word/words to your current nickname.\n" +
        "> `hide`: Hides your ELO from your nick.\n" +
        "> `reset`: Resets your nick to `[ELO] <your_ign>`.\n" +
        "> Modifies your nickname on Discord.\n"
        )
        .setAuthor({ name: "Ranked Bridge Help Menu", iconURL: "https://anify.club/images/Ranked_Bridge.png" })
        .setTimestamp();
    interaction.reply({ embeds: [helpEmbed] });
};