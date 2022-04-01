// When registering a new slash command, open a PowerShell window locally (on computer not Ptero panel)
// and do node deploy-commands.js.
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config/config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Pings @Queue Ping.'),
	new SlashCommandBuilder().setName('leaderboard').setDescription('Get\'s the leaderboard.').addStringOption(option => option.setName('type').setDescription('The type of leaderboard to display.').addChoices({ name: "ELO", value: "elo" }, { name: "Wins", value: "wins" }, { name: "Losses", value: "losses" }, { name: "Best Winstreak", value: "winstreak" }, { name: "Scorer", value: "score" }, { name: "Worst ELO", value: "worst" }, { name: "Games", value: "games" })),
	new SlashCommandBuilder().setName('register').setDescription('Registers you on Ranked Bridge.').addStringOption(option => option.setName('ign').setDescription("The Minecraft account to register as.").setRequired(true)),
	new SlashCommandBuilder().setName('rename').setDescription('Renames your account.').addStringOption(option => option.setName('ign').setDescription('The Minecraft account to rename as.').setRequired(true)),
	new SlashCommandBuilder().setName('screenshare').setDescription('Opens a Screenshare request.').addStringOption(option => option.setName('user').setDescription('The user to screenshare.').setAutocomplete(true).setRequired(true)),
	new SlashCommandBuilder().setName('report').setDescription('Opens a report ticket.').addStringOption(option => option.setName('user').setDescription('The user to report.').setAutocomplete(true).setRequired(true)),
	new SlashCommandBuilder().setName('stats').setDescription('Get\'s an user\'s stats.').addStringOption(option => option.setName('user').setDescription('The user to get the stats for.').setAutocomplete(true)),
	new SlashCommandBuilder().setName('void').setDescription('Send\'s a void request.'),
	new SlashCommandBuilder().setName('call').setDescription('Call\'s an user.').addUserOption(option => option.setName('user').setDescription('The user to call.').setRequired(true)),
	new SlashCommandBuilder().setName('score').setDescription('Sends a score request.').addAttachmentOption(option => option.setName('screenshot').setDescription('The screenshot to attach.').setRequired(true)),
	new SlashCommandBuilder().setName('scoregame').setDescription('Scores a game.')
		.addSubcommand(
			subcommand => subcommand.setName("arguments").setDescription("Arguments for the score command.")
			.addStringOption(option => option.setName('winner').setDescription('Select an user').setRequired(true).setAutocomplete(true))
			.addStringOption(option => option.setName('loser').setDescription('Select an user').setRequired(true).setAutocomplete(true))
			.addIntegerOption(option => option.setName('winner_score').setDescription('Winning team\'s score').setRequired(true))
			.addIntegerOption(option => option.setName('loser_score').setDescription('Losing team\'s score').setRequired(true))
	),
	new SlashCommandBuilder().setName('fregister').setDescription('Force registers an user.')
		.addUserOption(option => option.setName('user').setDescription("The user to register.").setRequired(true))
		.addStringOption(option => option.setName('ign').setDescription("The Minecraft account to register as.").setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
