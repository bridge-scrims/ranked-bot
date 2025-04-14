import { addShutdownTask } from "@/util/shutdown"
import mongoose from "mongoose"

export * from "./models/Game"
export * from "./models/Player"
export * from "./models/Queue"

export async function initDatabase() {
    addShutdownTask(() => mongoose.disconnect())
    await mongoose.connect(process.env["MONGO_URI"]!)
}
