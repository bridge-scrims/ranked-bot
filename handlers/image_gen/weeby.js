const config = require("../../config/config.json");

const { get } = require("node-superfetch");
// Weeby API
// NDI5NjU5NjQ0NjM0MzMzMTk1.KHzveiRjTeAOb9vhM2rpArDdjfPX4EHw2mllHgvA (API token)
// TdTfxfi9bBslrPWFaJw8 (webhook token)

module.exports.generateOne = generateOne;
module.exports.generateTwo = generateTwo;
module.exports.generateEject = generateEject;
module.exports.generateTriggered = generateTriggered;
module.exports.generateGif = generateGif;

async function generateOne(type, img) {
    return new Promise(async function (resolve, reject) {
        if (!img.endsWith(".png") && !img.endsWith(".jpg") && !img.endsWith(".gif")) {
            reject(null);
        }
        const { body } = await get(`https://weebyapi.xyz/generators/${type}?`)
            .set('Authorization', `Bearer ${config.weeby}`)
            .set('User-Agent', `Weeby-JS by NTM Development v2.0.0`)
            .query({ image: img }).catch((err) => reject(err));
        resolve(body);
    });
}

async function generateTwo(type, img, img2) {
    return new Promise(async function (resolve, reject) {
        if (!img.endsWith(".png") && !img.endsWith(".jpg") && !img.endsWith(".gif")) {
            reject(null);
        }
        const { body } = await get(`https://weebyapi.xyz/generators/${type}?`)
            .set('Authorization', `Bearer ${config.weeby}`)
            .set('User-Agent', `Weeby-JS by NTM Development v2.0.0`)
            .query({ firstimage: img, secondimage: img2 }).catch((err) => reject(err));
        resolve(body);
    });
}

async function generateEject(img, text, outcome) {
    return new Promise(async function (resolve, reject) {
        if (!img.endsWith(".png") && !img.endsWith(".jpg") && !img.endsWith(".gif")) {
            reject(null);
        }
        const { body } = await get(`https://weebyapi.xyz/generators/eject?`)
            .set('Authorization', `Bearer ${config.weeby}`)
            .set('User-Agent', `Weeby-JS by NTM Development v2.0.0`)
            .query({ image: img, text: text, outcome: outcome }).catch((err) => reject(err));
        resolve(body);
    });
}

async function generateTriggered(img, tint) {
    return new Promise(async function (resolve, reject) {
        if (!img.endsWith(".png") && !img.endsWith(".jpg") && !img.endsWith(".gif")) {
            reject(null);
        }
        const { body } = await get(`https://weebyapi.xyz/generators/triggered?`)
            .set('Authorization', `Bearer ${config.weeby}`)
            .set('User-Agent', `Weeby-JS by NTM Development v2.0.0`)
            .query({ image: img, tint: tint }).catch((err) => reject(err));
        resolve(body);
    });
}

async function generateGif(type) {
    return new Promise(async function (resolve, reject) {
        const { body } = await get(`https://weebyapi.xyz/gif/${type}`)
            .set('Authorization', `Bearer ${config.weeby}`)
            .set('User-Agent', `Weeby-JS by NTM Development v2.0.0`).catch((err) => reject(err));
        resolve(body.url);
    });
}