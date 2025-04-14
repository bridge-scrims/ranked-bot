import { initDatabase } from "./database"
import { initDiscord } from "./discord"

await initDatabase()
await initDiscord()
