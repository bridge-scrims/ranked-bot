import { Client, GatewayIntentBits } from "discord.js"

import { InteractionHandler } from "@/lib/discord/InteractionHandler"
import { registerEvents } from "@/lib/discord/registerEvents"
import { importDir } from "@/util/imports"

export const client = new Client({
    shards: "auto",
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
    presence: {
        status: "dnd",
        activities: [{ name: "Ranked Bridge" }],
    },
})

const handler = new InteractionHandler(client)
handler.addCommands(importDir(__dirname, "commands"))
handler.addComponents(importDir(__dirname, "buttons"))
registerEvents(client, importDir(__dirname, "events"))

export const colors = {
    baseColor: 0x5ca3f5,
    successColor: 0xbc77fc,
    errorColor: 0xff003c,
}

export async function initDiscord() {
    await client.login(process.env["CLIENT_TOKEN"]!)
    console.log(`Logged in as ${client.user!.tag}`)
}

export async function closeDiscord() {
    await client.destroy()
}
