import fs from "fs/promises"
import path from "path"

export async function importDir(...dir: string[]) {
    const search = path.join(...dir)
    const files = await fs.readdir(search, { recursive: true })
    return Promise.all(files.map((v) => import(path.join(search, v as string)).then((v) => v.default)))
}
