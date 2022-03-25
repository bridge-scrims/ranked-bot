// Queue array
let queue = [];

module.exports.addQueue = addQueue;
module.exports.getQueue = getQueue;
module.exports.removeQueue = removeQueue;
module.exports.clearQueue = clearQueue;
module.exports.removeIndex = removeIndex;

// Add the link to the queue array
/*
[guildId, link, type]
For files link contains URL and name ([url, name])
*/
function addQueue(id, link, type) {
    queue.push([id, link, type]);
}

// Remove the first item in the queue array.
function removeQueue(id) {
    for (let i = 0; i < queue.length; i++) {
        if (queue[i][0] === id) {
            queue.splice(i, 1);
            // Break to not remove any more items.
            break;
        }
    }
}

function removeIndex(id, index) {
    let num = 0;
    for (let i = 0; i < queue.length; i++) {
        if (queue[i][0] === id) {
            num++
            if (num === index) {
                queue.splice(i, 1);
                break;
            }
        }
    }
}

// Clearing the queue clears the entire queue that contains the guild id
function clearQueue(id) {
    for (let i = 0; i < queue.length; i++) {
        if (queue[i][0] === id) {
            queue.splice(i, 1);
        }
    }
}

// Get all music for a specific guild. Returns an array of links.
function getQueue(id) {
    let newQueue = [];
    for (let i = 0; i < queue.length; i++) {
        if (queue[i][0] === id) {
            newQueue.push([queue[i][1], queue[i][2]]);
        }
    }
    return newQueue;
}