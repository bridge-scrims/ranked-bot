const functions = require("../../handlers/functions.js");
const variables = require("../../handlers/variables.js");
const roles = require("../../config/roles.json");

const Discord = require("discord.js");
const mysql = require("mysql");

let config = require("../../config/config.json");

let con = mysql.createPool({
    connectionLimit: 100,
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
    debug: false
});

module.exports = async (client, interaction) => {

    // Autocomplete
    if (interaction.isAutocomplete()) {
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
    }

    if (interaction.isButton()) {
        if (interaction.customId === "score") {
            await interaction.deferReply({ ephemeral: true });
            let canScore = false;
            for (let i = 0; i < variables.score.length; i++) {
                if (variables.score[i][1] === interaction.channel.id) {
                    canScore = true;
                    if (variables.score[i][0] === interaction.member.id) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor('#a84040')
                            .setDescription("You can't score this game!")
                            .setTimestamp();
                        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                        return;
                    } else {
                        variables.score.splice(i, 1);
                        for (let j = 0; j < variables.curGames.length; j++) {
                            if (variables.curGames[j][1] === interaction.channel.id || variables.curGames[j][0] === interaction.member.id) {
                                variables.curGames.splice(j, 1);
                            }
                        }
                        for (let j = 0; j < variables.curGames.length; j++) {
                            if (variables.curGames[j][1] === interaction.channel.id || variables.curGames[j][0] === interaction.member.id) {
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
                    canScore = true;
                    if (variables.score[i][0] === interaction.member.id) {
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
    }

    // Commands
    if (interaction.isCommand()) {
        // If the user is rate limited...
        let isRateLimited = functions.isRateLimit(interaction.member.id);
        if (isRateLimited) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor(0x2f3136)
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