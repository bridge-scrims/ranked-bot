const anyanime = require("anyanime");
const ainasepics = require("ainasepics");

module.exports.genPfp = genPfp;
module.exports.genGif = genGif;

function genPfp() {
    return anyanime.anime();
}

async function genGif(type) {
    return new Promise(async function (resolve, reject) {
        if (type === "hug") {
            ainasepics.get('hug').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "cringe") {
            ainasepics.get('cringe').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "cry") {
            ainasepics.get('cry').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "kiss") {
            ainasepics.get('kiss').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "slap") {
            ainasepics.get('slap').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "punch") {
            ainasepics.get('punch').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "cheer") {
            ainasepics.get('cheer').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "pat") {
            ainasepics.get('pat').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "glomp") {
            ainasepics.get('glomp').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "cuddle") {
            ainasepics.get('cuddle').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "chase") {
            ainasepics.get('chase').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "dance") {
            ainasepics.get('dance').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "facepalm") {
            ainasepics.get('facepalm').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "handhold") {
            ainasepics.get('handhold').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "happy") {
            ainasepics.get('happy').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "hi") {
            ainasepics.get('hi').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "highfive") {
            ainasepics.get('highfive').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "laugh") {
            ainasepics.get('laugh').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "lick") {
            ainasepics.get('lick').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "love") {
            ainasepics.get('love').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "nervous") {
            ainasepics.get('nervous').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "nom") {
            ainasepics.get('nom').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "nope") {
            ainasepics.get('nope').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "panic") {
            ainasepics.get('panic').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "poke") {
            ainasepics.get('poke').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "pout") {
            ainasepics.get('pout').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "run") {
            ainasepics.get('run').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "sad") {
            ainasepics.get('sad').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
        if (type === "shrug") {
            ainasepics.get('shrug').then(imageData => resolve(imageData.url)).catch(err => console.error(err));
        }
    });
}