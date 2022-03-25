const sqlite3 = require("sqlite3").verbose();

// Get the db
let db = new sqlite3.Database('database.db');

module.exports.updateRole = updateRole;
module.exports.removeRole = removeRole;
module.exports.getRole = getRole;

// Updating the autorole
async function updateRole(id, role) {

    // Returns a promise, meaning you can do:
    /*
     * await updateRole(guild.id, role.id).then((res) =>{
     *  // If the promise is resolved.
     * }).catch((err) => {
     *  // If the promise is rejected.
     * });
    */
    return new Promise(function (resolve, reject) {
        db.serialize(async function () {
            // Get everything from the guild table where the guild id is equal to the id provided.
            await db.get('SELECT * FROM guild WHERE id = ?', [id], async function (err, rows, fields) {
                // If there's an error, then reject it.
                if (err) reject(err);
                if (!rows) {
                    // If the guild isn't in the database, insert it.
                    var stmt = db.prepare("INSERT INTO guild(id, autorole) VALUES ($id, $role)");
                    stmt.run({ $id: id, $role: role });
                    stmt.finalize();
                    // Resolve the promise.
                    resolve("Updated!");
                } else {
                    // If the guild is in the databsae, update the table and set the role.
                    let stmt = await db.prepare("UPDATE guild SET autorole = @role WHERE id = @id");
                    await stmt.bind({ "@id": id, "@role": role });
                    await stmt.run();
                    resolve("Updated role for " + id);
                }
            });
        });
    });
}

// Remove the role from the database.
async function removeRole(id) {
    return new Promise(function (resolve, reject) {
        db.serialize(async function () {
            // Get everything from the table.
            await db.get('SELECT * FROM guild WHERE id = ?', [id], async function (err, rows, fields) {
                if (err) reject(err);
                if (!rows) {
                    // If there aren't any roles, then return null.
                    resolve(null);
                } else {
                    // Otherwise, update the table and set the role to null.
                    let stmt = await db.prepare("UPDATE guild SET autorole = @role WHERE id = @id");
                    await stmt.bind({ "@id": id, "@role": null });
                    await stmt.run();
                    resolve("Done");
                }
            });
        });
    });
}

// Get the role based on the guild id.
async function getRole(id) {
    return new Promise(function (resolve, reject) {
        db.serialize(async function () {
            await db.get('SELECT * FROM guild WHERE id = ?', [id], function (err, rows, fields) {
                if (err) reject(err);
                if (!rows) {
                    // If there is no data for the guild, then return null.
                    resolve(null);
                } else {
                    // If the role is null, then return null.
                    if (rows.autorole === null || !rows.autorole || rows.autorole.length < 1) {
                        resolve(null);
                    } else {
                        // Return the role id.
                        resolve(rows.autorole);
                    }
                }
            });
        });
    });
}