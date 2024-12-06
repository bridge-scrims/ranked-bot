import { request } from "@/util/request"

export const BASE_URL = "https://api.scrims.network/v1"
export interface ScrimsUser {
    _id: string
    username: string
    discordId: string
}

export async function getUser(uuid: string) {
    const resp = await request(`${BASE_URL}/user`, { urlParams: { uuid } })
    const data = (await resp.json()) as UserResponse
    return data.success ? data.user_data : undefined
}

export async function getUserByUsername(username: string) {
    const resp = await request(`${BASE_URL}/user`, { urlParams: { username } })
    const data = (await resp.json()) as UserResponse
    return data.success ? data.user_data : undefined
}

interface UserResponse {
    success: boolean
    user_data: ScrimsUser
}
