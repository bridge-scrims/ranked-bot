import { createUser } from "../../../database/impl/players/impl/create";

export const register = async (guildId: string, userId: string, mcUUID: string) => {
    await createUser(guildId, userId, mcUUID);
};
