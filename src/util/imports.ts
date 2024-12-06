import fs from "fs"
import path from "path"

export function importDir(...dir: string[]) {
    const search = path.join(...dir)
    return (
        fs
            .readdirSync(search, { recursive: true })
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            .map((v) => require(path.join(search, v as string)).default)
    )
}
