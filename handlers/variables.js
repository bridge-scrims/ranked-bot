// [userID]
let pingCooldown = [];

// [userID, ELO, skips]
// Pushed when user joins VC
// Spliced when game is created or when user leaves the VC>
let queue = [];
let isMoving = [];

// [game ID]
// Pushed upon startup.
let games = [];

// [userID, game channel ID]
// Pushed when channels are created.
// Spliced when /scoregame is used or when user accepts score request.
let curGames = [];

// [game channel ID]
// Pushed when user uses /score.
// Spliced when /scoregame is used or when user accepts score request.
let score = [];

module.exports.queue = queue;
module.exports.isMoving = isMoving;
module.exports.pingCooldown = pingCooldown;
module.exports.games = games;
module.exports.curGames = curGames;
module.exports.score = score;