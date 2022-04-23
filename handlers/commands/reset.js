const Discord = require("discord.js");

const variables = require("../variables.js");
const channels = require("../../config/channels.json");
const functions = require("../functions.js");
const roles = require("../../config/roles.json");

const gameFunctions = require("../../handlers/game/gameFunctions.js");

module.exports.run = async (interaction) => {

    if (interaction.member.roles.cache.has(roles.admin)) {
        await interaction.guild.members.fetch().then(async members => {
            for(const member of members.values()) {
                if (!member.displayName) {
                    console.log("Couldn't get " + member.id + "'s display name.");
                    return;
                }
                if (member.displayName.includes("[") && member.displayName.includes("]")) {
                    let memberNick = member.displayName;
                    let splite = memberNick.split(" ");
                    await member.setNickname('[1000] ' + splite[1]);
                    console.log(member.displayName + " -> " + '[1000] ' + splite[1]);
                }
            }
        });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};