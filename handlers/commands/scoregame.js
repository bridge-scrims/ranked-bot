const Discord = require("discord.js");

const variables = require("../variables.js");
const channels = require("../../config/channels.json");
const functions = require("../functions.js");
const roles = require("../../config/roles.json");

const gameFunctions = require("../../handlers/game/gameFunctions.js");

module.exports.run = async (interaction) => {
    const winner = interaction.options.getString('winner');
    
    const loser = interaction.options.getString('loser');

    const winnerScore = interaction.options.getInteger('winner_score');
    const loserScore = interaction.options.getInteger('loser_score');

    if (interaction.member.roles.cache.has(roles.scorer)) {
        let wDb = await gameFunctions.isInDb(winner);
        let lDb = await gameFunctions.isInDb(loser);
        
        if (!wDb) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("Please provide a valid winner!")
                .setTimestamp();
            // Send the embd.
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (!lDb) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#a84040")
                .setDescription("Please provide a valid loser!")
                .setTimestamp();
            // Send the embd.
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (interaction.channel.name.startsWith("game-")) {
            let nameSplit = interaction.channel.name.split("-");
            let gameNum = nameSplit[1];

            if (winnerScore > 5 || winnerScore < 1) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("Please provide a valid winner score!")
                    .setTimestamp();
                // Send the embd.
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }
            if (loserScore > 4 || loserScore < 0) {
                const errorEmbed = new Discord.EmbedBuilder()
                    .setColor("#a84040")
                    .setDescription("Please provide a valid loser score!")
                    .setTimestamp();
                // Send the embd.
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

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

            for (let j = 0; j < variables.score.length; j++) {
                if (variables.score[j][1] === interaction.channel.id) {
                    variables.curGames.splice(j, 1);
                }
            }

            const wElo = await gameFunctions.getELO(winner);
            const lElo = await gameFunctions.getELO(loser);
            
            
            let calcElo = await gameFunctions.calcElo(winner, loser, winnerScore, loserScore);
            await gameFunctions.updateELO(winner, calcElo[0]);
            await gameFunctions.updateELO(loser, calcElo[1]);
            
            await gameFunctions.fixRoles(interaction, winner);
            await gameFunctions.fixRoles(interaction, loser);
            await gameFunctions.fixName(interaction, winner);
            await gameFunctions.fixName(interaction, loser);

            let wWins = await gameFunctions.getWins(winner);
            let wWs = await gameFunctions.getWinstreak(winner);
            let wBestws = await gameFunctions.getBestWinstreak(winner);
            let wGames = await gameFunctions.getGames(winner);

            let lLosses = await gameFunctions.getLosses(loser);
            let lGames = await gameFunctions.getGames(loser);
            
            await gameFunctions.setWins(winner, wWins + 1);
            await gameFunctions.setLosses(loser, lLosses + 1);
            await gameFunctions.setWinstreak(winner, wWs + 1);
            await gameFunctions.setWinstreak(loser, 0);
            if (wWs + 1 > wBestws) {
                await gameFunctions.setBestwinstreak(winner, wWs);
            }
            await gameFunctions.setUserGames(winner, wGames + 1);
            await gameFunctions.setUserGames(loser, lGames + 1);

            await gameFunctions.updateDivision(winner);
            await gameFunctions.updateDivision(loser);

            await gameFunctions.setGame(winner, loser, calcElo[0], calcElo[1], gameNum);

            const gameEmbed = new Discord.EmbedBuilder()
                .setColor('#36699c')
                .setTitle("Game #" + gameNum)
                .setDescription("**Winner:** [<@" + winner + ">]\n[`" + wElo + "` -> `" + calcElo[0] + "`]\n**Loser:** [<@" + loser + ">]\n[`" + lElo + "` -> `" + calcElo[1] + "`]\n**Score:** `" + winnerScore + "-" + loserScore + "`")
                .setFooter({ text: "Scored by " + interaction.member.user.tag })
                .setTimestamp();
            interaction.guild.channels.cache.get(channels.gamesChannel).send({ embeds: [gameEmbed] });
            console.log("Done!".green + ` Scored Game #${gameNum}.`.dim);
            interaction.channel.delete();
            var channel1 = interaction.member.guild.channels.cache.find(c => c.name === "Game " + gameNum + " Team 1");
            var channel2 = interaction.member.guild.channels.cache.find(c => c.name === "Game " + gameNum + " Team 2");
            if (!channel1 && !channel2) {
                return;
            }
            if (!channel2 && !channel1) {
                return;
            }
            if (!channel1) {
                channel2.delete().catch((err) => functions.sendError(functions.objToString(err), interaction.guild, "Deleting Channels"));
                return;
            }
            if (!channel2) {
                channel1.delete().catch((err) => functions.sendError(functions.objToString(err), interaction.guild, "Deleting Channels"));
                return;
            }
            channel1.delete().catch((err) => functions.sendError(functions.objToString(err), interaction.guild, "Deleting Channels"));
            channel2.delete().catch((err) => functions.sendError(functions.objToString(err), interaction.guild, "Deleting Channels"));
        } else {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor('#a84040')
                .setDescription("You can only use this command in game channels!")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    } else {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor('#a84040')
            .setDescription("You don't have permission to use this command!")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
};