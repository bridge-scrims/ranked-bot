import { Worker } from "../../../types";

export const changeNickname = async (worker: Worker, nickname: string) => {
    const guild = worker.client.guilds.cache.get(worker.data.guild_id);
    if (!guild) return;

    const member = guild.members.cache.get(worker.client.user?.id ?? "");
    if (!member) return;

    await member.setNickname(nickname);
};
