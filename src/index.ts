import "./util/node-util"

import { config } from "dotenv"
if (process.env["NODE_ENV"] !== "production") {
    config()
}

import { initDatabase } from "./database"
import { initDiscord, registration } from "./discord"

await registration()
await initDatabase()
await initDiscord()
