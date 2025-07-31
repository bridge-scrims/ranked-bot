import { handler, registration } from "@/discord"

await registration()
console.log("Registered commands: ", handler.getRegistered())
console.log("Appears to be in order ¯\\_(ツ)_/¯")
process.exit(0)
