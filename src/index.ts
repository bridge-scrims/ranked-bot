import dotenv from "dotenv";
dotenv.config();

import { init as initDatabase } from "./database";
import { init as initDiscord } from "./discord";

import { listener } from "./events/impl/listener";
import { antiCrash } from "./lib";

(async () => {
    await listener();

    await initDatabase();
    await initDiscord();

    antiCrash();
})();
