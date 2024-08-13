import { removeFromQueue } from "../../../database/impl/queues/impl/remove";
import { exists } from "./exists";

export const remove = async (guildId: string, channelId: string, memberId: string) => {
    if (!(await exists(guildId, channelId, memberId))) {
        return;
    }

    await removeFromQueue(guildId, channelId, memberId);
};
