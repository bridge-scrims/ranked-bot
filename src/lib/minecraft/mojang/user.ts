/**
 * @description Placeholder
 */

export const getUUID = async (username: string): Promise<string> => {
    const data = (await (
        await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    ).json()) as {
        id: string
        name: string
    }

    return data.id
}
