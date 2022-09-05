const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require("../config/config.json");
const gameFunctions = require("../handlers/game/gameFunctions.js");

let port = config.api_port;

const app = express();

app.use(require('express-domain-middleware'));

const corsOptions = {
    origin: '*',
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', config.anify);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("Request recieved for home");
    res.send("Hello world!");
    res.end();
});

app.post("/elo*", async function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    let uuid = body.uuid;
    let elo = await gameFunctions.getELOFromUuid(uuid);
    if (!elo) {
        res.send({ "error": "User doesn't exist in the database." });
    } else {
        res.send({ "elo": elo });
    }
});

app.post("/queue*", async(req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    let body = req.body;
    let uuid = body.uuid;
    let elo = body.elo;
    let discordId = await gameFunctions.getIdFromUuid(uuid);
    let remove = body.remove;

    if (remove) {
        if (gameFunctions.isInQueue(discordId)) {
            res.send({ "error": uuid + " is already in queue." });
        } else {
            gameFunctions.addToQueue(discordId, elo, 0);
            res.send({ "success": "Added " + uuid + " to queue." });
        }
    } else {
        if (gameFunctions.removeFromQueue(discordId)) {
            res.send({ "success": "Removed " + uuid + " from the queue." });
        } else {
            res.send({ "error": uuid + " was not in the queue." });
        }
    }
});

app.listen(port, async() => {
    console.log('Listening to port ' + port);
})

// For nginx, use start nginx to start the server.
// To stop it, get the pid of the process and kill it.
// tasklist /fi "imagename eq nginx.exe"
// Get the pid ^
// taskkill /f /pid *pid of nginx.exe*
// Kill the process ^