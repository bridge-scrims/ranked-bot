import { getQueue } from "../../../database/impl/queues/impl/get";
import { remove } from "./remove";

export const interval = async (guildId: string, channelId: string, memberId: string, skips: number) => {
    const timer = setInterval(async () => {
        console.log("FOR LOGGIN: Starting interval");

        const queue = await getQueue(guildId, channelId);
        const players = queue?.players || [];
        if (players.length <= 1) return clearInterval(timer);

        console.log("FOR LOGGIN: Players in queue: ", players.length);

        // Sort based on ELO
        players.sort((a, b) => a.elo - b.elo);

        // Assign skips object to each player
        players.forEach((player) => {
            Object.assign(player, { skips: 0 });
        });

        // Current index of the player
        let memberIndex = 0;

        // Range
        const range = 25;

        // Set the difference of the two people we're comparing. If the current index we're looping through is 0 or the last index,
        // then the difference will be the following:
        let diff1 = 10000000;
        let diff2 = 10000000;

        // Loop through each player
        for (let i = 0; i < players.length; i++) {
            if (players[i].user_id === memberId) {
                // Set the memberIndex.
                memberIndex = i;

                // If the memberIndex is not equal to 0...
                if (memberIndex !== 0) {
                    // The difference is the absolute value of the current user's ELO and the user with the ELO closest to the current user.
                    // (Hence why we sorted the queue)
                    diff1 = Math.abs(players[memberIndex].elo - players[memberIndex - 1].elo);
                }

                // If the memberIndex + 1 is less than the queue length (if you can get the user closest to the user AFTER the current user)
                if (memberIndex + 1 < players.length) {
                    // Get the absolute value of the current user's ELO and the user AFTER the current user
                    // (Hence why we sorted the queue)
                    diff2 = Math.abs(players[memberIndex].elo - players[memberIndex + 1].elo);
                }

                // If the difference of the user BEFORE the user is less than or equal to the difference of the user AFTER the user...
                if (diff1 <= diff2) {
                    if (diff1 < range + ((players[memberIndex - 1] as any as { skips: number }).skips + (players[memberIndex] as any as { skips: number }).skips * skips * 5)) {
                        // If the difference is less than 25 and accounts for skips...
                        // Get the two users.
                        const user1 = players[memberIndex - 1].user_id;
                        const user2 = players[memberIndex].user_id;

                        // Remove them from the queue
                        await remove(guildId, channelId, user1);
                        await remove(guildId, channelId, user2);

                        // Create the channels.
                        // Start game
                        console.log("gg can start game");

                        // Break the loop
                        clearInterval(timer);
                        break;
                    } else {
                        // If we can't match the users, then add skips to both users.
                        (players[memberIndex] as any as { skips: number }).skips++;
                        (players[memberIndex - 1] as any as { skips: number }).skips++;

                        console.log("FOR LOGGIN: Skips added");

                        skips++;
                    }
                }
            }
        }
    }, 2000);

    return;
};
