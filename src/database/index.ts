import mongoose from "mongoose"

export * from "./models/Game"
export * from "./models/Player"
export * from "./models/Queue"

export async function initDatabase() {
    await mongoose.connect(process.env["MONGO_URI"]!)
}

export async function closeDatabase() {
    await mongoose.disconnect()
}
