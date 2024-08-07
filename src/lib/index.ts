import EventEmitter2 from "eventemitter2";

export enum Events {
    DISCORD_READY = "discord.ready",
    DISCORD_COMMAND_REGISTER = "discord.command.register",
    COMPLETED_ENTRY_CREATION = "database.creation.completed",
}

const emitter = new EventEmitter2({});

export default emitter;
