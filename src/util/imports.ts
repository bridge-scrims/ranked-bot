import { glob } from "glob"
import path from "path"

export async function importDir<T>(...dir: string[]) {
    const search = path.join(...dir)
    const files = await glob("/**/*.js", { cwd: import.meta.dirname, root: search, absolute: false })
    return Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        files.map((v) => import(`./${v}`).then((v) => v.default as T)),
    )
}
