const Discord = require("discord.js");

const gameFunctions = require("../../handlers/game/gameFunctions.js");
const functions = require("../functions.js");
const channels = require("../../config/channels.json");
const roles = require("../../config/roles.json");
const variables = require("../variables.js");

module.exports.run = async (interaction) => {
    if (interaction.options.getSubcommand() === 'invite') {
        let isDb = await gameFunctions.isInDb(interaction.member.id);
        let user = interaction.options.getUser("user");
        if (interaction.member.id === user.id) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You can't party yourself!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        let userIsDb = await gameFunctions.isInDb(user.id);

        if (!isDb) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You aren't registered! To party other people, please register in <#" + channels.registerChannel + ">.\n\nIf you're already registered, please contact <@" + roles.staff + ">.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        if (!userIsDb) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("<@" + user.id + "> isn't registered! To party them they need to register in <#" + channels.registerChannel + ">.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (gameFunctions.isInParty(interaction.member.id)) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You're already in a party!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        
        let curElo = await gameFunctions.getELO(interaction.member.id);
        let userElo = await gameFunctions.getELO(user.id);
        if (Math.abs(curElo - userElo) > 30) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You and <@" + user.id + "> are not within 30 ELO of each other. You can only party people within that range.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (gameFunctions.isInParty(user.id)) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("<@" + user.id + "> is already in a party!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        if (gameFunctions.isPending(interaction.member.id, user.id)) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("There's already an invite outgoing/incoming from <@" + user.id + ">!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        variables.pendingParty.push([interaction.member.id, user.id]);

        const partyEmbed = new Discord.EmbedBuilder()
            .setColor('#36699c')
            .setTitle('Party Invite')
            .setDescription('<@' + interaction.member.id + "> has invited <@" + user.id + "> to a party.\n\nTo accept this invite, click the button below.")
            .setTimestamp()
        const buttons = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("paccept-" + user.id + "-" + interaction.member.id)
                .setLabel('Accept')
                .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
            .setCustomId("pdeny-" + user.id + "-" + interaction.member.id)
            .setLabel('Deny')
            .setStyle(Discord.ButtonStyle.Danger)
        );
        interaction.reply({ content: "<@" + user.id + ">", embeds: [partyEmbed], components: [buttons], fetchReply: true }).then((msg) => {
            setTimeout(() => {
                for (let i = 0; i < variables.pendingParty.length; i++) {
                    if (variables.pendingParty[i][0] === interaction.member.id || variables.pendingParty[i][1] === user.id || variables.pendingParty[i][1] === interaction.member.id || variables.pendingParty[i][0] === user.id) {
                        variables.pendingParty.splice(i, 1);
                    }
                }
                if (!msg || !msg.channel) {
                    return;
                }
                const expiredEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setTitle('Party Invite')
                    .setDescription('<@' + interaction.member.id + "> invite to <@" + user.id + "> has expired.")
                    .setTimestamp()
                msg.edit({ embeds: [expiredEmbed], components: [] });
            }, 60000);
        });
    }
    if (interaction.options.getSubcommand() === 'list') {
        let isDb = await gameFunctions.isInDb(interaction.member.id);
        if (!isDb) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You aren't registered! To party other people, please register in <#" + channels.registerChannel + ">.\n\nIf you're already registered, please contact <@" + roles.staff + ">.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        let party = gameFunctions.getParty(interaction.member.id);
        if (party.length === 0 || !party) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You aren't in a party!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }
        let partyEmbed = new Discord.EmbedBuilder()
            .setColor('#36699c')
            .setDescription('**<@' + party[0] + ">'s Party**:\n- <@" + party[1] + ">")
            .setTimestamp();
        interaction.reply({ embeds: [partyEmbed] });
    } else if (interaction.options.getSubcommand() === "leave") {
        let party = gameFunctions.getParty(interaction.member.id);
        if (party.length === 0 || !party) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("You aren't in a party!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        let partyMembers = [];
        for (let i = 0; i < variables.party.length; i++) {
            if (variables.party[i].includes(interaction.member.id)) {
                partyMembers.push(variables.party[i]);
                variables.party.splice(i, 1);
                break;
            }
        }
        if (partyMembers[0][1] === undefined) {
            interaction.reply("<@" + partyMembers[0][0] + "> has left the party.");
            return;
        }
        let partyEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription('The party has been disbanded.')
            .setTimestamp();
        interaction.reply({ content: "<@" + partyMembers[0][0] + "> <@" + partyMembers[0][1] + ">", embeds: [partyEmbed] });
    }
};