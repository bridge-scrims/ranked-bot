const { range, clientId } = require("../../config/config.json");

const { ghost, invisible, rankedPlayer } = require("../../config/roles.json");
// We need roles set up for the config.

// Functions. Need to revise.
const { exists } = require("../../handlers/functions.js");

const { getELO, makeChannel, isInDb } = require("../../handlers/game/gameFunctions.js");

const { queue, isMoving } = require("../../handlers/variables.js");

const { queueChannel, queueCategory, queueChatChannel, registerChannel } = require("../../config/channels.json");

module.exports = async (client, oldState, newState) => {
    // Deal with voice updates.
    if ((!oldState.streaming && newState.streaming) || (oldState.streaming && !newState.streaming) || (!oldState.serverDeaf && newState.serverDeaf) || (oldState.serverDeaf && !newState.serverDeaf) || (!oldState.serverMute && newState.serverMute) || (oldState.serverMute && !newState.serverMute) || (!oldState.selfDeaf && newState.selfDeaf) || (oldState.selfDeaf && !newState.selfDeaf) || (!oldState.selfMute && newState.selfMute) || (oldState.selfMute && !newState.selfMute) || (!oldState.selfVideo && newState.selfVideo) || (oldState.selfVideo && !newState.selfVideo)) {
    }

    // If the user leaves a VC...
    if (!oldState.channelID) {
        let memberID = oldState.member.id;
        if (exists(queue, memberID) && !exists(isMoving, memberID)) {
            // Check whether the user is already in queue.
            for (var i = 0; i < queue.length; i++) {
            // Loop through the array.
                if (queue[i][0] === memberID) {
                    // If the ID of the current loop is equal to the memberID...
                    console.log(oldState.member.user.tag + " left the queue.".dim);
                    queue.splice(i, 1);
                    newState.guild.members.fetch(clientId).then((member) => {
                        member.setNickname("[" + queue.length + "/2]");
                    }).catch((e) => console.log("Error setting the nickname of the bot!"));

                    setTimeout(async function () {
                        // Fetch the private queue channel.
                        let channelThing = await newState.guild.channels.cache.find((name) => name.name === memberID);
                        if (!channelThing) {
                            // If the channel is already deleted...
                            return;
                        }
                        // Delete the channel. If there's an error, log it.
                        channelThing.delete().catch((err) => console.error(err));
                    }, 4000);
                    break;
                }
            }
        }
    }

    // If newState.channel is not undefined...
    if (newState.channel) {
        // If the user is connected to the private VC...
        if (newState.channel.name === newState.member.id) {
            // Remove the user from the isMoving array (they are no longer being moved).
            for (var k = 0; k < isMoving.length; k++) {
                if (isMoving[k] === newState.member.id) {
                    isMoving.splice(k, 1);
                }
            }
        }
    }

    // If the channel the user is in is equal to the queue channel...
    if (newState.channelId === queueChannel) {
        // If the user who joins the channel is the bot, then return.
        if (newState.member.id === clientId || oldState.member.id === clientId) {
            return;
        }
        let memberId = newState.member.id;
        let isDb = await isInDb(memberId);
        if (!isDb) {
            newState.member.guild.channels.cache.get(queueChatChannel).send("<@" + newState.member.id + ">, you're not registered! Register in <#" + registerChannel + ">!");
        }
        if (!exists(queue, memberId) && !newState.member.roles.cache.has(ghost)) {
            console.log(newState.member.user.tag + " joined the queue VC.".dim);
            // Get the user's ELO
            let userELO = await getELO(memberId);
            if (!userELO) {
                newState.disconnect();
                return;
            }

            // User's skips
            let skips = 0;

            // Add the user to the queue array
            queue.push([memberId, userELO, 0]);

            // Set the bot's nickname
            newState.guild.members.fetch(clientId).then((member) => {
                member.setNickname("[" + queue.length + "/2]");
            }).catch((e) => console.log("Error setting the nickname!".red));

            // Invisible queueing
            if (newState.member.roles.cache.has(invisible)) {
                // Add the user to the moving array
                isMoving.push(memberId);
                // Create the channel with the name of the user's ID
                newState.guild.channels.create(newState.member.id, {
                    type: 2,
                    // Deny everyone from seeing the channel
                    permissionOverwrites: [
                        {
                            id: newState.guild.roles.everyone,
                            deny: ["ViewChannel", "Connect", "Speak"],
                        },
                        {
                            id: rankedPlayer,
                            deny: ["ViewChannel", "Connect", "Speak"],
                        },
                    ],
                }).then((channel) => {
                    // Move the channel to the queue category
                    channel.setParent(queueCategory);
                    // Move the user
                    newState.setChannel(channel.id).catch((e) => console.error(e));
                });
            }

            // Repeat
            var timer = setInterval(function () {
                // If there is more than one person in queue...
                if (queue.length > 1) {
                    // Sort the array based on ELO.
                    queue.sort((a, b) => a[1] - b[1]);

                    // memberIndex is the index of the member.
                    var memberIndex;

                    // Set the difference of the two people we're comparing. If the current index we're looping through is 0 or the last index,
                    // then the difference will be the following:
                    var diff1 = 10000000;
                    var diff2 = 10000000;

                    // Loop through the queue array.
                    for (var i = 0; i < queue.length; i++) {
                        // If the current index is the member...
                        if (queue[i][0] === memberId) {
                            // Set the memberIndex.
                            memberIndex = i;

                            // If the memberIndex is not equal to 0...
                            if (memberIndex != 0) {
                                // The difference is the absolute value of the current user's ELO and the user with the ELO closest to the current user.
                                // (Hence why we sorted the queue)
                                diff1 = Math.abs(queue[memberIndex][1] - queue[memberIndex - 1][1]);
                            }

                            // If the memberIndex + 1 is less than the queue length (if you can get the user closest to the user AFTER the current user)
                            if (memberIndex + 1 < queue.length) {
                                // Get the absolute value of the current user's ELO and the user AFTER the current user
                                // (Hence why we sorted the queue)
                                diff2 = Math.abs(queue[memberIndex][1] - queue[memberIndex + 1][1]);
                            }

                            // If the difference of the user BEFORE the user is less than or equal to the difference of the user AFTER the user...
                            if (diff1 <= diff2) {
                                // If newMember elo is closest to elo above it...
                                if (diff1 < (range + (queue[memberIndex - 1][2] + queue[memberIndex][2]) * skips * 5)) {
                                    // If the difference is less than 25 and accounts for skips...
                                    // Get the two users.
                                    const user1 = queue[memberIndex - 1][0];
                                    const user2 = queue[memberIndex][0];
                                    // Remove them from the array.
                                    queue.splice(memberIndex - 1, 2);
                                    // Create the channels.
                                    makeChannel(newState.member, user1, user2);

                                    // Break the loop
                                    clearInterval(timer);
                                    break;
                                } else {
                                    // If we can't match the users, then add skips to both users.
                                    queue[memberIndex][2]++;
                                    queue[memberIndex - 1][2]++;
                                    skips++;
                                }
                            }

                            // If the difference is closest to the ELO below it...
                            if (diff2 < diff1) {
                                if (diff2 < (range + (queue[memberIndex + 1][2] + queue[memberIndex][2]) * skips * 5)) {
                                    // If the difference is less than 25 and accounts for skips...
                                    // Get the two users.
                                    const user1 = queue[memberIndex + 1][0];
                                    const user2 = queue[memberIndex][0];
                                    // Remove them from the array.
                                    queue.splice(memberIndex, 2);
                                    // Create the channels.
                                    makeChannel(newState.member, user1, user2);

                                    // Break the loop
                                    clearInterval(timer);
                                    break;
                                } else {
                                    // If we can't match the users, then add skips to both users.
                                    queue[memberIndex][2]++;
                                    queue[memberIndex + 1][2]++;
                                    skips++;
                                }
                            }
                        }
                    }
                }
            }, 2000);
        } else {
            // idk
        }
    }
};