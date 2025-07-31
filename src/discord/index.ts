import { Client, ClientEvents, GatewayIntentBits } from "discord.js"

import { Command, Component, InteractionHandler } from "@/lib/discord/InteractionHandler"
import { EventHandler, registerEvents } from "@/lib/discord/registerEvents"
import { importDir } from "@/util/imports"
import { addShutdownTask } from "@/util/shutdown"

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

export const handler = new InteractionHandler(client)

export const colors = {
    baseColor: 0x5ca3f5,
    successColor: 0xbc77fc,
    errorColor: 0xff003c,
}

export async function registration() {
    const [commands, buttons, events] = await Promise.all([
        importDir<Command>(import.meta.dirname, "commands"),
        importDir<Component>(import.meta.dirname, "buttons"),
        importDir<EventHandler<keyof ClientEvents>>(import.meta.dirname, "events"),
    ])

    handler.addCommands(...commands)
    handler.addComponents(...buttons)
    registerEvents(client, events)
}

export async function initDiscord() {
    addShutdownTask(() => client.destroy())
    await client.login(process.env["CLIENT_TOKEN"])
    console.log(`Logged in as ${client.user!.tag}`)
}
