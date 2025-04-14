const tasks: (() => unknown)[] = []
export function addShutdownTask(task: () => unknown) {
    tasks.push(task)
}

function shutdown() {
    console.log("Shutting down...")
    const finished = Promise.all(tasks).catch(console.error)
    void Promise.race([finished, Bun.sleep(3000)]).then(() => process.exit())
}

process.on("SIGTERM", () => shutdown())
process.on("SIGINT", () => shutdown())
