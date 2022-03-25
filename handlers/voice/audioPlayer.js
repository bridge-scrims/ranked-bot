const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require("@discordjs/voice");
const audioQueue = require("./queue.js");

const functions = require("../functions.js");

const playdl = require('play-dl');

const Discord = require("discord.js");
const scdl = require("soundcloud-downloader").default;

const fetch = require("node-fetch");
const nodeStream = require("stream");
const fs = require("fs");
const util = require("util");

const config = require("../../config/config.json");

const { join } = require('node:path');

module.exports.playYouTube = playYouTube;
module.exports.playSoundCloud = playSoundCloud;
module.exports.playFile = playFile;
module.exports.pauseAudio = pauseAudio;
module.exports.unpauseAudio = unpauseAudio;
module.exports.stopAudio = stopAudio;
module.exports.skip = skip;
module.exports.fix = fix;
module.exports.getPlayer = getPlayer;

// Players is a 2d array of audio player objects and the guild id.
// [audioPlayer, guildId]
let players = [];

// Play the audio
// Channel is the voice channel object, guild is the guild object, info is the YouTUbe info from ytdl, volume is the volume to play the stream at,
// messageChannel is the text channel object.

async function playYouTube(channel, guild, quality, info) {
    // Get the stream via the function.
    let stream = await playdl.stream(info, { quality: quality });
    playAudio(channel, guild, stream, quality, "youtube");
}

async function playSoundCloud(channel, guild, quality, info) {
    // Get the stream via the function.
    // info is a SoundCloud URL
    scdl.download(info, config.scClientID).then(stream => {
        playAudio(channel, guild, { "stream": stream }, quality, "soundcloud");
    }).catch((err) => {
        console.error(err);
    });
}

async function playFile(channel, guild, quality, file) {
    // Create a stream
    const streamPipeline = util.promisify(nodeStream.pipeline);
    // Fetch the URL/link of the file to play
    const response = await fetch(file.url ?? file.link);
    // Convert the buffer (response.body) into a stream and save the file locally.
    await streamPipeline(response.body, fs.createWriteStream(`./handlers/voice/music/${file.name}`));

    playAudio(channel, guild, file, quality, "file");
}

async function playAudio(channel, guild, stream, quality, type) {
    // Create the audio player.
    const player = createAudioPlayer();

    players.push([player, guild.id]);

    // Join the voice channel.
    let connection = await joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    });
    // Subscribe to the connection to play audio.
    connection.subscribe(player);
    
    if (!stream) {
        console.log("Error! No stream.".red);
    }
    let resource;
    // If the type is a file...
    if (type === "file") {
        // The resource is equal to the file. Discord creates a resource from the file.
        resource = createAudioResource(join(__dirname, "./music/" + stream.name));
    } else {
        // Otherwise, the resource is equal to the play-dl stream.
        resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });
    }
    // Play the resource.
    player.play(resource);

    // If the player errors
    player.on('error', async error => {
        functions.sendError(functions.objToString(err), guild, "Playing Audio");
        console.error(`Error: ${error.message} with resource`.red);
        console.error(error);
    });

    // If the player get's disconnected, the stop audio, clear the queue, and leave the VC.
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        stopAudio(guild.id);
        connection.destroy();
        audioQueue.clearQueue(guild.id);
        return;
    });

    // If the audioplayer is idle or the music has finished playing.
    player.on(AudioPlayerStatus.Idle, async () => {
        // Remove the current playing audio.
        audioQueue.removeQueue(guild.id);
        // Get the queue for the guild.
        let queue = audioQueue.getQueue(guild.id);
        // Remove the player for the guild.
        removePlayer(guild.id);
        if (queue.length === 0 || !queue) {
            // If the queue is empty, return and destroy the connection.
            connection.destroy();
            return;
        } else {
            // Get the updated queue for the guild.
            let newQueue = audioQueue.getQueue(guild.id);
            // The type of media to play next.
            type = newQueue[0][1];
            if (type === "file") {
                // If it's a file, then delete the past music played.
                fs.unlink(join(__dirname, "./music/" + stream.name), (err) => {
                    if (err) {
                        throw err;
                        // Unfortunately, the music might still be played and the file won't get deleted.
                    }
                    console.log("Deleted ".red + stream.name + ".".red);
                });
            }
            // Get the new info for the queue and play the next song.
            playNext(channel, guild, quality, type);
        }
    });
}

// Skip a track.
async function skip(guildId) {
    // Get the player, then stop the audio which triggers the idle state.
    getPlayer(guildId).stop();
}

// Fix function.
async function fix(channel, guildId) {
    // Get the player and connection.
    let player = getPlayer(guildId);
    const connection = getVoiceConnection(guildId);
    if (!connection) {
        // If there's no connection (the bot isn't in the VC), return.
        return;
    } else {
        if (!player) {
            // If the player doesn't exist, then create it and add the player to the guild.
            const player = createAudioPlayer();
            players.push([player, guildId]);

            // Get the queue.
            let queueThing = audioQueue.getQueue(guildId);
            if (queueThing.length === 0 || !queueThing) {
                // If the queue is empty, return.
                return;
            } else {
                // Get the next media to play.
                type = queueThing[0][1];
                // Play it.
                playNext(channel, guild, 0, type);
            }
        } else {
            // If the player exists, get the queue.
            let queueThing = audioQueue.getQueue(guildId);
            if (queueThing.length === 0 || !queueThing) {
                // If the queue is empty, return.
                return;
            } else {
                // Get the next media to play.
                type = queueThing[0][1];
                // Play it.
                playNext(channel, guild, 4, type);
            }
        }
    }
}

// Play the next track.
async function playNext(channel, guild, quality, type) {
    // Array:
    // [guildId, link, type]
    // For getting the queue, it is [link, type].
    // Link for YouTube is the YouTube URL, but for files it is [url, name]. So for files the array is [guildId, [url, name], type]
    
    // All this does is just reiterate the playAudio function.
    if (type === "file") {
        let file = audioQueue.getQueue(guild.id)[0][0];
        const streamPipeline = util.promisify(nodeStream.pipeline);
        const response = await fetch(file[0]);
        await streamPipeline(response.body, fs.createWriteStream(`./handlers/voice/music/${file[1]}`));
        let stream = { "name": file[1] };
        playAudio(channel, guild, stream, quality, type);
    } else if (type === "soundcloud") {
        let queue = audioQueue.getQueue(guild.id);
        scdl.download(queue[0][0], "NWyir7Pc3gfcUBG1Hv4r7khp5xEtrYBi").then(stream => {
            playAudio(channel, guild, { "stream": stream }, quality, type);
        }).catch((err) => {
            console.error(err);
        });
    } else {
        let queue = audioQueue.getQueue(guild.id);
        let stream = await playdl.stream(queue[0][0]);
        playAudio(channel, guild, stream, quality, type);
    }
}

// Pause the track.
async function pauseAudio(guildId) {
    let player = getPlayer(guildId);
    if (!player) {
        return false;
    } else {
        // If you can pause the audio, return true.
        if (player.pause()) {
            return true;
        } else {
            return false;
        }
    }
}

// Resume the track.
async function unpauseAudio(guildId) {
    let player = getPlayer(guildId);
    if (!player) {
        return false;
    } else {
        if (player.unpause()) {
            return true;
        } else {
            return false;
        }
    }
}

// Stop the track.
async function stopAudio(guildId) {
    // Get the connection.
    const connection = getVoiceConnection(guildId);
    if (!connection) {
        return false;
    } else {
        // Clear the queue.
        audioQueue.clearQueue(guildId);
        let player = getPlayer(guildId);
        if (player != undefined) {
            // Stop the audio.
            player.stop();
        }
        // Destroy the connection (because there's no need to play anything anymore).
        connection.destroy();
        // Remove the player from the guild.
        removePlayer(guildId);
        return true;
    }
}

// Get the player.
function getPlayer(guildId) {
    // The array contains AudioPlayer objects.
    for (let i = 0; i < players.length; i++) {
        if (players[i][1] === guildId) {
            return players[i][0];
        }
    }
    return null;
}

// Remove the player from the guild.
function removePlayer(guildId) {
    for (let i = 0; i < players.length; i++) {
        if (players[i][1] === guildId) {
            players.splice(i, 1);
        }
    }
}