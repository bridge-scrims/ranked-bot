import { type Client, type ClientEvents } from "discord.js"

export function registerEvents(client: Client, events: EventHandler<keyof ClientEvents>[]) {
    for (const event of events) {
        if (event.once) client.once(event.name, event.execute)
        else client.on(event.name, event.execute)
    }
}

export interface EventHandler<E extends keyof ClientEvents> {
    name: E
    once?: boolean
    execute: (...args: ClientEvents[E]) => Promise<unknown>
}
