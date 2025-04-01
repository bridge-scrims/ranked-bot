import fs from "fs/promises"
import path from "path"

export async function importDir<T>(...dir: string[]) {
    const search = path.join(...dir)
    const files = await fs.readdir(search, { recursive: true })
    return Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        files.map((v) => import(path.join(search, v)).then((v) => v.default as T)),
    )
}
