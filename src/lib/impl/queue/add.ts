import { addToQueue } from "../../../database/impl/queues/impl/add";
import { exists } from "./exists";

export const add = async (guildId: string, channelId: string, memberId: string) => {
    if (await exists(guildId, channelId, memberId)) {
        return;
    }

    await addToQueue(guildId, channelId, memberId);
};
