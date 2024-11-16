import EventEmitter2 from "eventemitter2";

export enum Events {
    DISCORD_READY = "discord.ready",
    DISCORD_COMMAND_REGISTER = "discord.command.register",
    DATABASE_CONNECT = "database.connect",
    DATABASE_INITIATED = "database.initiated",
    DATABASE_QUEUE_CREATE = "database.queue.create",
    DATABASE_PLAYER_CREATE = "database.player.create",
    DATABASE_PLAYER_UPDATE = "database.player.update",
    DATABASE_GAMES_CREATE = "database.games.create",
    DATABASE_GAMES_UPDATE = "database.games.update",
    QUEUE_READY = "queue.ready",
    QUEUE_SYNC = "queue.sync",
    QUEUE_PLAYER_ADD = "queue.player.add",
    QUEUE_PLAYER_REMOVE = "queue.player.remove",
    GAME_CREATE = "game.create",
    GAME_VOID = "game.void",
    GAME_FINISH = "game.finish",
    GAME_SCORED = "game.scored",
    WORKER_READY = "worker.ready",
    WORKER_FETCHED = "worker.fetched",
    WORKER_COMMAND_REGISTER = "worker.command.register",
}

const emitter = new EventEmitter2({});

export default emitter;
