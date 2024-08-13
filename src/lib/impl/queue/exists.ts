import { getQueue } from "../../../database/impl/queues/impl/get";

export const exists = async (guildId: string, channelId: string, memberId: string) => {
    const queue = await getQueue(guildId, channelId);
    if (queue?.players.find((player) => player.user_id === memberId)) {
        return true;
    }

    return false;
};
