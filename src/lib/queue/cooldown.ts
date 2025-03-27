const TIMEOUT = 60 * 1000
const listeners: ((player: string) => unknown)[] = []
const cooldowns = new Set<string>()

export function addCooldown(player: string) {
    cooldowns.add(player)
    setTimeout(() => removeCooldown(player), TIMEOUT)
}

export function onCooldown(player: string) {
    return cooldowns.has(player)
}

export function removeCooldown(player: string) {
    cooldowns.delete(player)
    listeners.forEach((call) => call(player))
}

export function onCooldownExpire(call: (player: string) => unknown) {
    listeners.push(call)
}
