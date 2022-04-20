const functions = require("../../handlers/functions.js");
const variables = require("../../handlers/variables.js");
const roles = require("../../config/roles.json");

const gameFunctions = require("../../handlers/game/gameFunctions.js");

const Discord = require("discord.js");
const mysql = require("mysql");

let config = require("../../config/config.json");

let con = mysql.createPool({
    connectionLimit: 1000,
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    port: config.port,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    debug: false
});

module.exports = async (client, interaction) => {

    // Autocomplete
    if (interaction.isAutocomplete()) {
        if (interaction.options._subcommand != "unban") {
            let focusedOption = interaction.options.getFocused().toString();
            con.query(`SELECT * FROM rbridge WHERE name LIKE '${focusedOption}%' LIMIT 10`, (err, rows) => {
                if (err) return;
                if (!rows || rows.length < 1) return;
                let options = rows.map((row) => ({
                    name: row.name,
                    value: row.id,
                }));
                interaction.respond(options).catch((err) => console.error(err));
            });
        } else {
            let focusedOption = interaction.options.getFocused().toString();
            con.query(`SELECT * FROM banned WHERE name LIKE '${focusedOption}%' LIMIT 10`, (err, rows) => {
                if (err) return;
                if (!rows || rows.length < 1) return;
                let options = rows.map((row) => ({
                    name: row.name,
                    value: row.id,
                }));
                interaction.respond(options).catch((err) => console.error(err));
            });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === "invisible") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.invisible);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.invisible + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.invisible + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.invisible + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "queue-ping") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.queuePing);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.queuePing + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.queuePing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.queuePing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "announcement-ping") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.announcementPing);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.announcementPing + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.announcementPing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.announcementPing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "scorer-ping") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.scorerPing);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.scorerPing + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.scorerPing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.scorerPing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "event-ping") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.eventPing);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.eventPing + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.eventPing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.eventPing + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "blue") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterBlue);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterBlue + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterBlue + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterBlue + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "red") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterRed);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterRed + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterRed + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterRed + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "green") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterGreen);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterGreen + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterGreen +"> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterGreen + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "purple") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterPurple);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterPurple + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterPurple + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterPurple + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "pink") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterPink);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterPink + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterPink + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterPink + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "orange") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterOrange);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterOrange + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterOrange + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterOrange + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "yellow") {
            await interaction.deferReply({ ephemeral: true });
            let hasRole = await gameFunctions.toggleRole(interaction.guild, interaction.member, roles.boosterYellow);
            if (hasRole === null) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("<@&" + roles.boosterYellow + "> role doesn't exist. Please contact a staff member.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
                return;
            }
            if (!hasRole) {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("Gave you the <@&" + roles.boosterYellow + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            } else {
                const pingEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("Removed the <@&" + roles.boosterYellow + "> role.")
                    .setTimestamp();
                interaction.editReply({ embeds: [pingEmbed], ephemeral: true });
            }
        }

        if (interaction.customId === "support") {
            await interaction.deferReply({ ephemeral: true });
            let channelId = await gameFunctions.supportTicket(interaction.guild, interaction.member);
            if (channelId) {
                const supportEmbed = new Discord.EmbedBuilder()
                    .setColor("#58f55d")
                    .setDescription("<#" + channelId + ">")
                    .setTimestamp();
                interaction.editReply({ embeds: [supportEmbed], ephemeral: true });
            }
        }
        if (interaction.customId === "score") {
            await interaction.deferReply({ ephemeral: true });
            let canScore = false;
            for (let i = 0; i < variables.score.length; i++) {
                if (variables.score[i][1] === interaction.channel.id) {
                    canScore = true;
                    if (variables.score[i][0] === interaction.member.id || variables.score[i][2] === interaction.member.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("You can't score this game!")
                            .setTimestamp();
                        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    } else {
                        variables.score.splice(i, 1);
                        for (let j = 0; j < variables.curGames.length; j++) {
                            if (variables.curGames[j][2] === interaction.channel.id || variables.curGames[j][0] === interaction.member.id || variables.curGames[j][1] === interaction.member.id) {
                                variables.curGames.splice(j, 1);
                            }
                        }
                        for (let j = 0; j < variables.curGames.length; j++) {
                            if (variables.curGames[j][2] === interaction.channel.id || variables.curGames[j][0] === interaction.member.id || variables.curGames[j][1] === interaction.member.id) {
                                variables.curGames.splice(j, 1);
                            }
                        }
                        var channelName = interaction.channel.name;
                        var splitName = channelName.split('-');
                        var channelNum = splitName[1];
                        var channel1 = interaction.member.guild.channels.cache.find(c => c.name === "Game " + channelNum + " Team 1");
                        var channel2 = interaction.member.guild.channels.cache.find(c => c.name === "Game " + channelNum + " Team 2");
                        if (!channel1) {
                            interaction.editReply("Couldn't delete channel 1. Ping Scorer Ping.");
                            return;
                        }
                        if (!channel2) {
                            interaction.editReply("Couldn't delete channel 2. Ping Scorer Ping.");
                            return;
                        }
                        channel1.delete();
                        channel2.delete();
                        interaction.channel.permissionOverwrites.set([
                            {
                                id: interaction.channel.guild.roles.everyone,
                                deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                            },
                            {
                                id: roles.scorer,
                                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                            },
                        ]);
                        interaction.channel.setName(interaction.channel.name + "-finished");
                        interaction.channel.send("<@&" + roles.scorerPing + ">");
                        interaction.editReply("Done.");
                        break;
                    }
                }
            }
            if (!canScore) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You can't score this game!")
                    .setTimestamp();
                interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
        }
        if (interaction.customId === "deny") {
            await interaction.deferReply({ ephemeral: true });
            let canScore = false;
            for (let i = 0; i < variables.score.length; i++) {
                if (variables.score[i][1] === interaction.channel.id) {
                    console.log(variables.score[i]);
                    canScore = true;
                    if (variables.score[i][0] === interaction.member.id || variables.score[i][2] === interaction.member.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("You can't score this game!")
                            .setTimestamp();
                        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    } else {
                        variables.score.splice(i, 1);
                        interaction.editReply("Done.");
                        const denyEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("<@" + interaction.member.id + "> has denied the score request.")
                            .setTimestamp();
                        interaction.channel.send({ embeds: [denyEmbed] });
                        break;
                    }
                }
            }
            if (!canScore) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You can't score this game!")
                    .setTimestamp();
                interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
        }

        if (interaction.customId === "void") {
            await interaction.deferReply({ ephemeral: true });
            let canVoid = false;
            for (let i = 0; i < variables.voids.length; i++) {
                if (variables.voids[i][1] === interaction.channel.id) {
                    canVoid = true;
                    if (variables.voids[i][0] === interaction.member.id || variables.voids[i][2] === interaction.member.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("You can't void this game!")
                            .setTimestamp();
                        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    } else {
                        variables.voids.splice(i, 1);
                        for (let j = 0; j < variables.curGames.length; j++) {
                            if (variables.curGames[j][2] === interaction.channel.id || variables.curGames[j][0] === interaction.member.id || variables.curGames[j][1] === interaction.member.id) {
                                variables.curGames.splice(j, 1);
                            }
                        }
                        for (let j = 0; j < variables.curGames.length; j++) {
                            if (variables.curGames[j][2] === interaction.channel.id || variables.curGames[j][0] === interaction.member.id || variables.curGames[j][1] === interaction.member.id) {
                                variables.curGames.splice(j, 1);
                            }
                        }
                        var channelName = interaction.channel.name;
                        var splitName = channelName.split('-');
                        var channelNum = splitName[1];
                        var channel1 = interaction.member.guild.channels.cache.find(c => c.name === "Game " + channelNum + " Team 1");
                        var channel2 = interaction.member.guild.channels.cache.find(c => c.name === "Game " + channelNum + " Team 2");
                        if (!channel1) {
                            interaction.editReply("Couldn't delete channel 1. Ping Scorer Ping.");
                            return;
                        }
                        if (!channel2) {
                            interaction.editReply("Couldn't delete channel 2. Ping Scorer Ping.");
                            return;
                        }
                        channel1.delete();
                        channel2.delete();
                        interaction.channel.delete();
                        break;
                    }
                }
            }
            if (!canVoid) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You can't void this game!")
                    .setTimestamp();
                interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
        }
        if (interaction.customId === "antivoid") {
            await interaction.deferReply({ ephemeral: true });
            let canVoid = false;
            for (let i = 0; i < variables.voids.length; i++) {
                if (variables.voids[i][1] === interaction.channel.id) {
                    canVoid = true;
                    if (variables.voids[i][0] === interaction.member.id || variables.voids[i][2] === interaction.member.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("You can't void this game!")
                            .setTimestamp();
                        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    } else {
                        variables.voids.splice(i, 1);
                        interaction.editReply("Done.");
                        const denyEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("<@" + interaction.member.id + "> has denied the void request.")
                            .setTimestamp();
                        interaction.channel.send({ embeds: [denyEmbed] });
                        break;
                    }
                }
            }
            if (!canVoid) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor('#a84040')
                    .setDescription("You can't void this game!")
                    .setTimestamp();
                interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
        }
    }

    // Commands
    if (interaction.isCommand()) {
        // If the user is rate limited...
        let isRateLimited = functions.isRateLimit(interaction.member.id);
        if (isRateLimited) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You are being rate limited. You can only send commands every 4 seconds.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            // Return to stop the command.
            return;
        } else {
            // Rate limit the user if they currently aren;t rate limited.
            functions.rateLimit(interaction.member.id);
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                command.run(interaction);
                let text;
                if (interaction.options._hoistedOptions.length === 0 && !interaction.options._subcommand) {
                    text = `${interaction.member.user.tag} used /${interaction.commandName}.`.dim;
                }
                if (interaction.options._subcommand != null) {
                    if (interaction.options._hoistedOptions.length > 0) {
                        let hoistedOptions = "";
                        for (let i = 0; i < interaction.options._hoistedOptions.length; i++) {
                            let option = interaction.options._hoistedOptions[i];
                            let name = option.name;
                            let value = option.value;
                            hoistedOptions += " " + value + "[" + name + "]";
                        }
                        text = `${interaction.member.user.tag} used /${interaction.commandName} ${interaction.options._subcommand}${hoistedOptions}.`.dim;
                    } else {
                        text = `${interaction.member.user.tag} used /${interaction.commandName} ${interaction.options._subcommand}.`.dim;
                    }
                }
                if (interaction.options._hoistedOptions.length > 0) {
                    let hoistedOptions = "";
                    for (let i = 0; i < interaction.options._hoistedOptions.length; i++) {
                        let option = interaction.options._hoistedOptions[i];
                        let name = option.name;
                        let value = option.value;
                        hoistedOptions += " " + value + "[" + name + "]";
                    }
                    text = `${interaction.member.user.tag} used /${interaction.commandName}${hoistedOptions}.`.dim;
                }
                console.log(text)
            } catch (error) {
                functions.sendError(functions.objToString(error), interaction.guild, "Executing Command");
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
};