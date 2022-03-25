module.exports.getOneTypes = getOneTypes;
module.exports.getTwoTypes = getTwoTypes;
module.exports.getGifTypes = getGifTypes;

function getOneTypes(str) {
    let stringOfTypes = "3000years, airpods, amiajoke, bad, beautiful, berniemittens, bobross, challenger, delet, dexter, fear, garbage, heman, jokeoverhead, painting, patrick, photograph, picture, respect, sacred, thumbs, tobecontinued, truth, wanted, wedontdothathere, whodidthis, worthless, leonardopointing, jojoshock, hot, soraselfie, helivesinyou, stonks, mycollectiongrows, tableflip, tattoo, leonardoglass, standingkitty, rickripswall, wynaut, berniefinancialsupport, vsaucecomputer, waitthatsillegal, thanossnap, forfivehours, markmeta, squidwardcancer".split(", ");
    let validTypes = [];

    for (let i = 0; i < stringOfTypes.length; i++) {
        validTypes.push(stringOfTypes[i]);
    }

    let isValid = false;
    for (let i = 0; i < validTypes.length; i++) {
        if (validTypes[i] === str) {
            isValid = true;
        }
    }
    return { "valid": isValid, "types": validTypes };
}

function getTwoTypes(str) {
    let stringOfTypes = "batslap, bed, crush, cuddle, dwightscared, hug, nani, peterglasses, samepicture, ship, whowouldwin, expectreality, amogus, sus, startedgoing, rtx".split(", ");
    let validTypes = [];

    for (let i = 0; i < stringOfTypes.length; i++) {
        validTypes.push(stringOfTypes[i]);
    }

    let isValid = false;
    for (let i = 0; i < validTypes.length; i++) {
        if (validTypes[i] === str) {
            isValid = true;
        }
    }
    return { "valid": isValid, "types": validTypes };
}

function getGifTypes(str) {
    let stringOfTypes = "akko, angry, baka, bath, blow, boom, boop, beer, bite, blush, bonk, bored, brofist, cafe, cheer, chase, clap, confused, cookie, cringe, cry, cuddle, cute, dab, dance, facepalm, feed, flower, fly, gabriel, glomp, grin, grumpy, happy, hate, handhold, hide, highfive, hug, icecream, kick, kiss, laugh, lick, love, lurk, miyano, nervous, no, nom, nuzzle, panic, pat, peace, pikachu, police, poke, pout, punch, rawr, run, sagiri, shh, shrug, sip, slap, sleepy, smug, stare, sword, tease, teleport, think, throw, thumbs, tickle, triggered, wag, wave, wedding, whisper, wink, yes, zerotwo".split(", ");
    let validTypes = [];

    for (let i = 0; i < stringOfTypes.length; i++) {
        validTypes.push(stringOfTypes[i]);
    }

    let isValid = false;
    for (let i = 0; i < validTypes.length; i++) {
        if (validTypes[i] === str) {
            isValid = true;
        }
    }
    return { "valid": isValid, "types": validTypes };
}