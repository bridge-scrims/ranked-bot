import { addShutdownTask } from "@/util/shutdown"
import mongoose from "mongoose"

export * from "./impl/models/Game"
export * from "./impl/models/Player"
export * from "./impl/models/Queue"

export async function initDatabase() {
    addShutdownTask(() => mongoose.disconnect())
    await mongoose.connect(process.env["MONGO_URI"]!)
}
