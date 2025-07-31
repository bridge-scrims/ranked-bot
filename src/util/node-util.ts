declare global {
    interface Date {
        toSeconds(): number
    }

    interface Array<T> {
        toMap(...keys: string[]): Record<string, T>
        toMultiMap(...keys: string[]): Record<string, T[]>
    }

    function record<T>(constant: Record<string, T>): Readonly<Record<string, T>>
    function sleep(ms: number): Promise<void>

    interface Console {
        /** Log a message if not in production */
        debug(this: void, message?: unknown, ...params: unknown[]): void

        /** Log an error if not in production */
        debugError(this: void, message?: unknown, ...params: unknown[]): void
    }
}

Date.prototype.toSeconds = function () {
    return Math.floor(this.valueOf() / 1000)
}

function read(obj: unknown, keys: string[]) {
    if (!keys.length) return (obj as Record<string, unknown>)["id"]
    return keys.reduce((v, key) => (v as Record<string, unknown>)?.[key], obj)
}

Array.prototype.toMap = function (...keys: string[]) {
    return Object.fromEntries(this.map((v) => [read(v, keys) as string, v]))
}

Array.prototype.toMultiMap = function (...keys: string[]) {
    const map: Record<string, unknown[]> = {}
    this.forEach((value) => {
        const key = read(value, keys) as string
        if (!map[key]?.push(value)) {
            map[key] = [value]
        }
    })
    return map
}

global.record = (constant) => Object.freeze(constant)
global.sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

if (process.env["NODE_ENV"] !== "production") {
    console.debug = console.log
    console.debugError = console.error
} else {
    console.debug = () => {}
    console.debugError = () => {}
}
