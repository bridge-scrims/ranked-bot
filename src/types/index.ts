import { Client } from "discord.js";

export type Script = {
    name: string;
    description: string;
    action: (...args: any) => Promise<void>;
};

export type Worker = {
    id: string;
    client: Client;
    data: WorkerDB;
};

export type WorkerDB = {
    id: string;
    guild_id: string;
    credentials: {
        client_id: string;
        client_token: string;
    };
    created_at: string;
};

export type Queue = {
    id: string;
    guild_id: string;
    channel_id: string;
    channel_name: string;
    game_channel_id: string;
    players: Player[];
    workers: WorkerDB[];
    created_at: string;
};

export type Player = {
    id: string;
    guild_id: string;
    user_id: string;
    mc_uuid: string;
    elo: number;
    wins: number;
    losses: number;
    win_streak: number;
    best_win_streak: number;
    created_at: string;
};

export type PlayerQueue = Player & {
    skips: number;
    matched: boolean;
};

export type ScrimsUserData = {
    _id: string;
    blockhitSounds: boolean;
    cages: string[];
    lastLogin: number;
    lastLogout: number;
    messagePrivacy: "public" | "private" | "friends";
    playtime: number;
    prefix: string;
    privateGames: "public" | "private" | "friends";
    pronouns: string;
    ranked: Record<
        string,
        {
            elo: number;
            games: number;
            wins: number;
        }
    >;
    skillRoll: string;
    spectators: "shown" | "hidden";
    stats: {
        bridge: {
            casual: Record<string, ScrimsGameData>;
            duel: Record<string, ScrimsGameData>;
            ranked: Record<string, ScrimsGameData>;
            private: Record<string, ScrimsGameData>;
        };
        overall: {
            winstreak: number;
            dailyWinstreak: number;
            lifetimeWinstreak: number;
        };
    };
    skin: {
        signature: string;
        textures: string;
    };
    username: string;
    discordId: string;
};

export type ScrimsGameData = {
    wins: number;
    losses: number;
    games: number;
    kills: number;
    deaths: number;
    playerCausedDeaths: number;
    goals: number;
    blocksPlaced: number;
    blocksBroken: number;
    damageDealt: number;
    gapplesEaten: number;
    arrowsShot: number;
    arrowsHit: number;
    hitsGiven: number;
    hitsTaken: number;
    hitsBlocked: number;
    yLevelSum: number;
    secondsSpentPlaying: number;
    draws: number;
};

export type Game = {
    id: string;
    game_id: string;
    guild_id: string;
    team1_ids: string[];
    team2_ids: string[];
    team1_score: number;
    team2_score: number;
    channel_ids: {
        textChannel: string;
        vc1: string;
        vc2: string;
    };
    created_at: string;
};
