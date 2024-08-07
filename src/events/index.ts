import EventEmitter2 from "eventemitter2";

export enum Events {
    DISCORD_READY = "discord.ready",
    DISCORD_COMMAND_REGISTER = "discord.command.register",
    DATABASE_CONNECT = "database.connect",
    DATABASE_INITIATED = "database.initiated",
    DATABASE_QUEUE_CREATE = "database.queue.create",
}

const emitter = new EventEmitter2({});

export default emitter;
