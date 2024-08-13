import { removeFromQueue } from "../../../database/impl/queues/impl/remove";
import { exists } from "./exists";

export const remove = async (guildId: string, channelId: string, memberId: string) => {
    if (await exists(guildId, channelId, memberId)) {
        // Remove the player from the queue
        await removeFromQueue(guildId, channelId, memberId);
        return;
    } else {
        return;
    }
};
