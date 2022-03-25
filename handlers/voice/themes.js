const AnimeThemes = require("animethemes-parser");
const functions = require("../functions.js");

module.exports.getOpening = getOpening;

async function getOpening(query) {
    return new Promise(async function (resolve, reject) {
        const parser = new AnimeThemes()

        parser.all()
            .then(themes => {
                let title;
                let anime = themes.find((x) => {
                    let possible = x.title.toLowerCase();
                    let input = query.toLowerCase();
                    if (functions.similarity(possible, input) * 100 > 70) {
                        title = x.title;
                        return possible;
                    }
                });
                if (!anime) {
                    resolve(null);
                    return;
                }
                resolve({ "themes": anime.themes, "title": title });
            })
    });
}