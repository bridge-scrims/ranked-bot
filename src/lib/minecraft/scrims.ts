import { request } from "@/util/request"

const BASE_URL = "https://api.scrims.network/v1"

export async function getUser(uuid: string) {
    const resp = await request(`${BASE_URL}/user?${new URLSearchParams({ uuid })}`)
    const data = (await resp.json()) as UserResponse
    return data.success ? data.user_data : undefined
}

export async function getUserByUsername(username: string) {
    const resp = await request(`${BASE_URL}/user?${new URLSearchParams({ username })}`)
    const data = (await resp.json()) as UserResponse
    return data.success ? data.user_data : undefined
}

export async function fetchGame(id: string) {
    const resp = await request(`${BASE_URL}/game?${new URLSearchParams({ id })}`)
    const data = (await resp.json()) as GameResponse
    return data.success ? data.game_data : undefined
}

export interface ScrimsUser {
    _id: string
    username: string
    discordId: string
}

export interface ScrimsTeam {
    name: string
    colour: string
    players: string[]
    goals: number
}

export interface ScrimsGame {
    _id: string
    gameType: string
    timestamp: number
    duration: number
    mode: string
    map: string
    winner: string
    teams: ScrimsTeam[]
}

interface UserResponse {
    success: boolean
    user_data: ScrimsUser
}

interface GameResponse {
    success: boolean
    game_data: ScrimsGame
}
