const Discord = require("discord.js");

const variables = require("../../handlers/variables.js");
const channels = require("../../config/channels.json");
const functions = require("../../handlers/functions.js");
const roles = require("../../config/roles.json");
const gameFunctions = require("../../handlers/game/gameFunctions.js");

module.exports = async (client, message) => {
    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice().toLowerCase();

    if (cmd.toLowerCase() === "=ping") {
        if (message.channel.id === channels.queueChatChannel) {
            if (!message.member.voice || !message.member.voice.channel) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You have to be in <#" + channels.queueChannel + "> to use `/ping`.")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
            if (message.member.voice.channel != channels.queueChannel) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You have to be in <#" + channels.queueChannel + "> to use `/ping`.")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
            if (!functions.exists(variables.pingCooldown, message.member.id)) {
                message.reply("<@&" + roles.queuePing + ">");
                variables.pingCooldown.push(message.member.id);
                setTimeout(function() {
                    for (let i = 0; i < variables.pingCooldown.length; i++) {
                        if (variables.pingCooldown[i] === message.member.id) {
                            variables.pingCooldown.splice(i, 1);
                        }
                    }
                }, 60000);
            } else {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You can only ping <@&" + roles.queuePing + "> once every minute.")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
        } else {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You can only use `=ping` in <#" + channels.queueChatChannel + ">.")
                .setTimestamp();
            message.reply({ embeds: [errorEmbed] });
            return;
        }
    }

    if (cmd.toLowerCase() === "=help") {
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
        message.reply({ embeds: [helpEmbed] });
    }

    if (cmd.toLowerCase().startsWith("=register")) {
        if (message.channel.id === channels.registerChannel) {
            if (args.length < 2) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You need to provide an username!")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
            let username = args[1];
            await gameFunctions.getUUID(username).then(async (data) => {
                if (!data.name) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor('#a84040')
                        .setDescription("`" + username + "` isn't a valid username!")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
                await gameFunctions.getHypixel(data.uuid).then(async (hypixel) => {
                    let socialMedia = hypixel.player.socialMedia;
                    if (!socialMedia || !socialMedia.links || !socialMedia.links.DISCORD) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("`" + data.name + "` hasn't linked their Discord!")
                            .setTimestamp();
                        message.reply({ embeds: [errorEmbed] });
                        return;
                    }
                    if (socialMedia.links.DISCORD != undefined) {
                        let linkedDiscord = socialMedia.links.DISCORD;
                        if (linkedDiscord != message.member.user.tag) {
                            const errorEmbed = new Discord.EmbedBuilder()
                                .setColor('#a84040')
                                .setDescription("`" + data.name + "`'s account is linked to `" + linkedDiscord + "`!")
                                .setTimestamp();
                            message.reply({ embeds: [errorEmbed] });
                            return;
                        }
                        let isDb = await gameFunctions.isInDb(message.member.id);
                        let rankedRole = await gameFunctions.getRole(message.guild, roles.rankedPlayer);
                        let unverifiedRole = await gameFunctions.getRole(message.guild, roles.unverified);
                        let coalDiv = await gameFunctions.getRole(message.guild, roles.coalDivision);
                        message.member.roles.add(rankedRole);
                        message.member.roles.add(coalDiv);
                        message.member.roles.remove(unverifiedRole);
    
                        if (!isDb) {
                            await gameFunctions.insertUser(message.member.id, data.name);
                            let uuid = await gameFunctions.getUUID(data.name);
                            const successEmbed = new Discord.EmbedBuilder()
                                .setColor('#36699c')
                                .setAuthor({ name: "Registered you as " + data.name + "!", iconURL: "https://mc-heads.net/avatar/" + uuid.uuid + "/64"})
                                .setTimestamp();
                            message.reply({ embeds: [successEmbed], ephemeral: true });
                            message.member.setNickname("[1000] " + data.name);
                            return;
                        } else {
                            let uuid = await gameFunctions.getUUID(data.name);
                            const successEmbed = new Discord.EmbedBuilder()
                                .setColor('#36699c')
                                .setAuthor({ name: "Welcome back " + data.name + "!", iconURL: "https://mc-heads.net/avatar/" + uuid.uuid + "/64"})
                                .setTimestamp();
                            message.reply({ embeds: [successEmbed], ephemeral: true });
                            let elo = await gameFunctions.getELO(message.member.id);
                            message.member.setNickname("[" + elo + "] " + data.name);
                            return;
                        }
                    }
                }).catch((err) => {
                    functions.sendError(functions.objToString(err), message.guild, "Hypixel API")
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor('#a84040')
                        .setDescription("<@" + message.member.id + ">, an error occurred! Please try again.")
                        .setTimestamp();
                    message.channel.send({ embeds: [errorEmbed] }).then((msg) => {
                        setTimeout(function() {
                            if (!msg) {
                                return;
                            } else {
                                msg.delete();
                            }
                        }, 4000);
                    });
                    return;
                });
            }).catch((err) => {
                functions.sendError(functions.objToString(err), message.guild, "Mojang API")
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("An error occurred! Please try again.")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed], ephemeral: true });
                console.error(err);
                return;
            });
        } else {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You can only use `=register` in <#" + channels.registerChannel + ">.")
                .setTimestamp();
            message.reply({ embeds: [errorEmbed] });
            return;
        }
    }

    if (cmd.toLowerCase().startsWith("=score")) {
        let isIG = false;
        for (let i = 0; i < variables.curGames.length; i++) {
            if (variables.curGames[i][0] === message.member.id) {
                if (variables.curGames[i][2] === message.channel.id) {
                    isIG = true;
                    let canScore = true;
                    for (var j = 0; j < variables.score.length; j++) {
                        if (variables.score[j][1] === message.channel.id) {
                            const errorEmbed = new Discord.EmbedBuilder()
                                .setColor('#a84040')
                                .setDescription("Someone's already scoring this!")
                                .setTimestamp();
                            message.reply({ embeds: [errorEmbed] });
                            canScore = false;
                            return;
                        }
                    }

                    if (canScore) {
                        if (!message.attachments.first()) {
                            const errorEmbed = new Discord.EmbedBuilder()
                                .setColor('#a84040')
                                .setDescription("Please provide a valid image! Correct file types include `.jpeg`, `.png`, and `.jpg`.")
                                .setTimestamp();
                            message.reply({ embeds: [errorEmbed] });
                        } else {
                            let fileB = true;
                            message.attachments.forEach(async attachment => {
                                if (fileB) {
                                    let file = attachment.proxyURL;
                                    if (file.toLowerCase().endsWith(".jpg") || file.toLowerCase().endsWith(".png") || file.toLowerCase().endsWith(".jpeg")) {
                                        variables.score.push([message.member.id, message.channel.id, variables.curGames[i][1]]);
                                        const scoreEmbed = new Discord.EmbedBuilder()
                                            .setColor('#36699c')
                                            .setTitle('Score Request')
                                            .setDescription('Please click the button if the screenshot is correct! If it isn\'t, then deny the score request.')
                                            .setImage(file.url)
                                            .setTimestamp()
                                        const buttons = new Discord.ActionRowBuilder()
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                                .setCustomId("score")
                                                .setLabel('Score')
                                                .setStyle(Discord.ButtonStyle.Success),
                                            new Discord.ButtonBuilder()
                                            .setCustomId("deny")
                                            .setLabel('Deny')
                                            .setStyle(Discord.ButtonStyle.Danger)
                                        );
                                        message.reply({ embeds: [scoreEmbed], components: [buttons] });
                                        fileB = false;
                                    }
                                }
                            });
                            if (fileB) {
                                const errorEmbed = new Discord.EmbedBuilder()
                                    .setColor('#a84040')
                                    .setDescription("Please provide a valid image! Correct file types include `.jpeg`, `.png`, and `.jpg`.")
                                    .setTimestamp();
                                message.reply({ embeds: [errorEmbed] });
                            }
                        }
                    }
                }
            }
        }

        if (!isIG) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You're not in a game.")
                .setTimestamp();
            message.reply({ embeds: [errorEmbed] });
            return;
        }
    }

    if (cmd.toLowerCase().startsWith("=party") || cmd.toLowerCase().startsWith("=p")) {
        if (args.length < 2) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("Invalid arguments!")
                .setTimestamp();
            message.reply({ embeds: [errorEmbed] });
            return;
        }
        if (args[1].toLowerCase() === "leave") {
            let party = gameFunctions.getParty(message.member.id);
            if (party.length === 0 || !party) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("You aren't in a party!")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
    
            let partyMembers = [];
            for (let i = 0; i < variables.party.length; i++) {
                if (variables.party[i].includes(message.member.id)) {
                    partyMembers.push(variables.party[i]);
                    variables.party.splice(i, 1);
                    break;
                }
            }
            if (partyMembers[0][1] === undefined) {
                message.reply("<@" + partyMembers[0][0] + "> has left the party.");
                return;
            }
            let partyEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription('The party has been disbanded.')
                .setTimestamp();
            message.reply({ content: "<@" + partyMembers[0][0] + "> <@" + partyMembers[0][1] + ">", embeds: [partyEmbed] });
        } else if (args[1].toLowerCase() === "list") {
            let isDb = await gameFunctions.isInDb(message.member.id);
            if (!isDb) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("You aren't registered! To party other people, please register in <#" + channels.registerChannel + ">.\n\nIf you're already registered, please contact <@" + roles.staff + ">.")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
            let party = gameFunctions.getParty(message.member.id);
            if (party.length === 0 || !party) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("You aren't in a party!")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            }
            let partyEmbed = new Discord.EmbedBuilder()
                .setColor('#36699c')
                .setDescription('**<@' + party[0] + ">'s Party**:\n- <@" + party[1] + ">")
                .setTimestamp();
            message.reply({ embeds: [partyEmbed] });
        } else {
            let mention = message.mentions.members.first();
            if (!mention) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You need to mention an user to party!")
                    .setTimestamp();
                message.reply({ embeds: [errorEmbed] });
                return;
            } else {
                let isDb = await gameFunctions.isInDb(message.member.id);
                if (message.member.id === mention.id) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("You can't party yourself!")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
                let userIsDb = await gameFunctions.isInDb(mention.id);
                if (!isDb) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("You aren't registered! To party other people, please register in <#" + channels.registerChannel + ">.\n\nIf you're already registered, please contact <@" + roles.staff + ">.")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
                if (!userIsDb) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("<@" + mention.id + "> isn't registered! To party them they need to register in <#" + channels.registerChannel + ">.")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
        
                if (gameFunctions.isInParty(message.member.id)) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("You're already in a party!")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
                
                if (gameFunctions.isInParty(mention.id)) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("<@" + mention.id + "> is already in a party!")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
                if (gameFunctions.isPending(message.member.id, mention.id)) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor("#a84040")
                        .setDescription("There's already an invite outgoing/incoming from <@" + mention.id + ">!")
                        .setTimestamp();
                    message.reply({ embeds: [errorEmbed] });
                    return;
                }
                variables.pendingParty.push([message.member.id, mention.id]);
        
                const partyEmbed = new Discord.EmbedBuilder()
                    .setColor('#36699c')
                    .setTitle('Party Invite')
                    .setDescription('<@' + message.member.id + "> has invited <@" + mention.id + "> to a party.\n\nTo accept this invite, click the button below.")
                    .setTimestamp()
                const buttons = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId("paccept-" + mention.id + "-" + message.member.id)
                        .setLabel('Accept')
                        .setStyle(Discord.ButtonStyle.Success),
                    new Discord.ButtonBuilder()
                    .setCustomId("pdeny-" + mention.id + "-" + message.member.id)
                    .setLabel('Deny')
                    .setStyle(Discord.ButtonStyle.Danger)
                );
                message.reply({ content: "<@" + mention.id + ">", embeds: [partyEmbed], components: [buttons], fetchReply: true }).then((msg) => {
                    setTimeout(() => {
                        for (let i = 0; i < variables.pendingParty.length; i++) {
                            if (variables.pendingParty[i][0] === message.member.id || variables.pendingParty[i][1] === mention.id || variables.pendingParty[i][1] === message.member.id || variables.pendingParty[i][0] === mention.id) {
                                variables.pendingParty.splice(i, 1);
                            }
                        }
                        if (!msg || !msg.channel) {
                            return;
                        }
                        const expiredEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setTitle('Party Invite')
                            .setDescription('<@' + message.member.id + "> invite to <@" + mention.id + "> has expired.")
                            .setTimestamp()
                        msg.edit({ embeds: [expiredEmbed], components: [] });
                    }, 60000);
                });
            }
        }
    }
};