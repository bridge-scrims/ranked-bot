import { ApplicationCommandOptionType, Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { env } from "../env";
import emitter, { Events } from "../events";
import { initQueue } from "../lib";
import { init as initWorkers } from "../workers";

export const client = new Client({
    shards: "auto",
    intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions],
    presence: {
        status: "dnd",
        activities: [{ name: "Ranked Bridge" }],
    },
});

export const commands = [
    await import("./impl/commands/clearQueue"),
    await import("./impl/commands/createQueue"),
    await import("./impl/commands/getQueue"),
    await import("./impl/commands/register"),
    await import("./impl/commands/void"),
    await import("./impl/commands/score"),
    await import("./impl/commands/scoreGame"),
    await import("./impl/commands/leaderboard"),
    await import("./impl/commands/games"),
];
export const buttons = [await import("./impl/buttons/void"), await import("./impl/buttons/score"), await import("./impl/buttons/leaderboard"), await import("./impl/buttons/games")];
export const modals: any[] = [];
export const events = [await import("./impl/events/ready"), await import("./impl/events/interactionCreate"), await import("./impl/events/voiceStateUpdate")];

export const colors = {
    baseColor: 0x5ca3f5,
    successColor: 0xbc77fc,
    errorColor: 0xff003c,
};

export const init = async () => {
    await registerEvents();
    await registerCommands();

    await client.login(env.CLIENT_TOKEN);

    for (const guild of client.guilds.cache.values()) {
        await initQueue(guild.id);
        await initWorkers(guild.id);
    }
};

export const registerCommands = async () => {
    const rest = new REST().setToken(env.CLIENT_TOKEN);

    const commandList: SlashCommandBuilder[] = [];

    for (const command of commands) {
        await client.application?.commands.set([command.default]);

        const slashCommand = new SlashCommandBuilder()
            .setName((command.default as { name: string }).name)
            .setDescription((command.default as { description: string }).description)
            .setDefaultMemberPermissions((command.default as { defaultMemberPermissions: string }).defaultMemberPermissions);

        if (
            (
                command.default as any as {
                    subcommands: { name: string; description: string; options: { name: string; description: string; type: ApplicationCommandOptionType; autocomplete?: boolean; required?: boolean; choices?: any }[] }[];
                }
            ).subcommands?.length > 0
        ) {
            for (const subcommand of (
                command.default as any as {
                    subcommands: { name: string; description: string; options: { name: string; description: string; type: ApplicationCommandOptionType; autocomplete?: boolean; required?: boolean; choices?: any }[] }[];
                }
            ).subcommands) {
                const sub = new SlashCommandSubcommandBuilder();

                sub.setName(subcommand.name).setDescription(subcommand.description);

                if (subcommand.options.length > 0) {
                    for (const option of subcommand.options) {
                        switch (option.type) {
                            case ApplicationCommandOptionType.String:
                                sub.addStringOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setAutocomplete(option.autocomplete || false)
                                        .setChoices(option.choices || [])
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Channel:
                                sub.addChannelOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Attachment:
                                sub.addAttachmentOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Boolean:
                                sub.addBooleanOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Integer:
                                sub.addIntegerOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Mentionable:
                                sub.addMentionableOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Number:
                                sub.addNumberOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.Role:
                                sub.addRoleOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                            case ApplicationCommandOptionType.User:
                                sub.addUserOption((opt) =>
                                    opt
                                        .setName(option.name)
                                        .setDescription(option.description)
                                        .setRequired(option.required || false),
                                );
                                break;
                        }
                    }
                }

                slashCommand.addSubcommand(sub);
            }
        }

        if (
            (
                command.default as {
                    options: { name: string; description: string; type: ApplicationCommandOptionType; autocomplete?: boolean; required?: boolean }[];
                }
            ).options?.length > 0
        ) {
            for (const option of (
                command.default as {
                    options: { name: string; description: string; type: ApplicationCommandOptionType; autocomplete?: boolean; required?: boolean; choices?: any }[];
                }
            ).options) {
                switch (option.type) {
                    case ApplicationCommandOptionType.String:
                        slashCommand.addStringOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setAutocomplete(option.autocomplete || false)
                                .setChoices(option.choices || [])
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Channel:
                        slashCommand.addChannelOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Attachment:
                        slashCommand.addAttachmentOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Boolean:
                        slashCommand.addBooleanOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Integer:
                        slashCommand.addIntegerOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Mentionable:
                        slashCommand.addMentionableOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Number:
                        slashCommand.addNumberOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.Role:
                        slashCommand.addRoleOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                    case ApplicationCommandOptionType.User:
                        slashCommand.addUserOption((opt) =>
                            opt
                                .setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false),
                        );
                        break;
                }
            }
        }

        commandList.push(slashCommand);
        await emitter.emit(Events.DISCORD_COMMAND_REGISTER, command.default);
    }

    if (env.USE_GUILD_COMMANDS) {
        console.log(`Using guild commands for guild ${env.GUILD_ID}`);
        await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), { body: commandList });
    } else {
        await rest.put(Routes.applicationCommands(env.CLIENT_ID), { body: commandList });
    }
};

export const registerEvents = async () => {
    for (const event of events) {
        if (event.default.once) {
            client.once(event.default.name, event.default.execute);
            continue;
        }

        client.on(event.default.name, event.default.execute);
    }
};
