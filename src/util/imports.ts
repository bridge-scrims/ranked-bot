import { glob } from "glob"
import path from "path"

const CWD = path.join(process.cwd(), "src")
const FILES = "/**/*.ts"

export async function importDir<T>(...dir: string[]) {
    const search = path.join(...dir)
    const files = await glob(`${search}${FILES}`, { cwd: CWD })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Promise.all(files.map((v) => import(`../${v}`).then((v) => v.default as T)))
}
