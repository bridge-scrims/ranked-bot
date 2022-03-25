const sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('database.db');

module.exports.updateRole = updateRole;
module.exports.removeRole = removeRole;
module.exports.getRole = getRole;

async function updateRole(id, role) {
    return new Promise(function (resolve, reject) {
        db.serialize(async function () {
            await db.get('SELECT * FROM guild WHERE id = ?', [id], async function (err, rows, fields) {
                if (err) reject(err);
                if (!rows) {
                    var stmt = db.prepare("INSERT INTO guild(id, staffrole) VALUES ($id, $role)");
                    stmt.run({ $id: id, $role: role });
                    stmt.finalize();
                    resolve("Updated!");
                } else {
                    let stmt = await db.prepare("UPDATE guild SET staffrole = @role WHERE id = @id");
                    await stmt.bind({ "@id": id, "@role": role });
                    await stmt.run();
                    resolve("Updated role for " + id);
                }
            });
        });
    });
}

async function removeRole(id) {
    return new Promise(function (resolve, reject) {
        db.serialize(async function () {
            await db.get('SELECT * FROM guild WHERE id = ?', [id], async function (err, rows, fields) {
                if (err) reject(err);
                if (!rows) {
                    resolve(null);
                } else {
                    let stmt = await db.prepare("UPDATE guild SET staffrole = @role WHERE id = @id");
                    await stmt.bind({ "@id": id, "@role": null });
                    await stmt.run();
                    resolve("Done");
                }
            });
        });
    });
}

async function getRole(id) {
    return new Promise(function (resolve, reject) {
        db.serialize(async function () {
            await db.get('SELECT * FROM guild WHERE id = ?', [id], function (err, rows, fields) {
                if (err) reject(err);
                if (!rows) {
                    resolve(null);
                } else {
                    resolve(rows.staffrole);
                }
            });
        });
    });
}