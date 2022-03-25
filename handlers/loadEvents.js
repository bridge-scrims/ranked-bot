const fs = require("fs");

module.exports = async (client) => {
    try {
        // The amount of events loaded.
        let amount = 0;
        // Pass the parameter "dir" for loading events.
        const loadDir = (dir) => {
            console.log("Loading directory ".yellow + dir + "...".yellow);
            // Get all the events folder with the directory dir. Ex. ./events/client, ./events/guild.
            // Filter all the files with files ending in .js.
            const eventFiles = fs.readdirSync(`./events/${dir}`).filter((file) => file.endsWith(".js"));
            // Loop through all the files with the variable name "file".
            for (const file of eventFiles) {
                try {
                    // Get the event file.
                    const event = require(`../events/${dir}/${file}`);
                    // Get the file name (since the event has .js at the end. Ex. ready.js.).
                    let eventName = file.split(".")[0];
                    // Load the event.
                    client.on(eventName, event.bind(null, client));
                    amount++;
                } catch (err) {
                    console.log(err);
                }
            }
        };
        // Load the directors of ./events/client and ./events/guild (that's what forEach is for).
        await ["client", "guild"].forEach(e => loadDir(e));
        console.log(amount + ` events loaded!`.dim.green);
    } catch (err) {
        console.log(err);
    }
};