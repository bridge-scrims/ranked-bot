import { closeDatabase, initDatabase } from "./database"
import { closeDiscord, initDiscord } from "./discord"
import { destroyWorkers } from "./workers"

process.on("SIGINT", () => {
    Promise.race([
        Promise.all([
            closeDiscord().catch(console.error),
            closeDatabase().catch(console.error),
            destroyWorkers(),
        ]),
        Bun.sleep(3000),
    ]).then(() => process.exit())
})

await initDatabase()
await initDiscord()
