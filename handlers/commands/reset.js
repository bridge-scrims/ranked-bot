const Discord = require("discord.js");

const configColors = require("../../config/colors.json");
const roles = require("../../config/roles.json");

module.exports.run = async (interaction) => {

    if (interaction.member.roles.cache.has(roles.admin)) {
        /*
        await interaction.guild.members.fetch().then(async members => {
            for(const member of members.values()) {
                if (!member || member.id === "593882880854196228") {
                    return;
                }
                if (!member.displayName) {
                    console.log("Couldn't get " + member.id + "'s display name.");
                    return;
                }
                if (member.displayName.includes("[") && member.displayName.includes("]") && !member.displayName.includes("[1000")) {
                    let memberNick = member.displayName;
                    let splite = memberNick.split(" ");
                    console.log(member.displayName + " -> " + '[1000] ' + splite[1]);
                    await member.setNickname('[1000] ' + splite[1]);
                }
            }
        });
        console.log("Done.");
        */
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("ratio")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor(configColors.error)
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};