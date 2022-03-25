const generateWaifu = require("waifu-generator");
const { get } = require("@mattplays/waifu.js");

const { join } = require("path");
const functions = require("../../../handlers/functions.js");

module.exports.gen = gen;
module.exports.type = type;

function gen() {
    return new Promise(async function (resolve, reject) {
        const id = functions.makeId(15);
        const options = {
            filename: id,
            path: "./handlers/image_gen/waifu/images/"
        };

        generateWaifu(options).then((res) => {
            resolve({ "path": join(__dirname, "./images/" + id + ".png"), "file": id + ".png" });
        }).catch(e => reject(e));
    });
}

function type(type) {
    return new Promise(async function (resolve, reject) {
        if (type === "blush") {
            get("sfw", "blush").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "kick") {
            get("sfw", "kick").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "shinobu") {
            get("sfw", "shinobu").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "bully") {
            get("sfw", "bully").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "cuddle") {
            get("sfw", "cuddle").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "cry") {
            get("sfw", "cry").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "hug") {
            get("sfw", "hug").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "kiss") {
            get("sfw", "kiss").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "lick") {
            get("sfw", "lick").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "pat") {
            get("sfw", "pat").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "smug") {
            get("sfw", "smug").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "bonk") {
            get("sfw", "bonk").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "yeet") {
            get("sfw", "yeet").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "smile") {
            get("sfw", "smile").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "wave") {
            get("sfw", "wave").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "highfive") {
            get("sfw", "highfive").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "handhold") {
            get("sfw", "handhold").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "nom") {
            get("sfw", "nom").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "bite") {
            get("sfw", "bite").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "glomp") {
            get("sfw", "glomp").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "slap") {
            get("sfw", "slap").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "happy") {
            get("sfw", "happy").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
        if (type === "wink") {
            get("sfw", "wink").then((data) => {
                resolve(data.url);
            }).catch((err) => {
                reject(err);
            });
        }
    });
}