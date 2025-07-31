import CryptoJS from "crypto-js"

const secret = process.env["ENCRYPTION_SECRET"]
if (!secret && process.env["NODE_ENV"] === "production") {
    throw new Error("ENCRYPTION_SECRET not set")
}

const SECRET = secret ?? "testing"
const CONFIG = { mode: CryptoJS.mode.ECB }

export function encrypt(message: string) {
    return CryptoJS.AES.encrypt(message, SECRET, CONFIG).toString()
}

export function decrypt(cipher: string) {
    return CryptoJS.AES.decrypt(cipher, SECRET, CONFIG).toString(CryptoJS.enc.Utf8)
}
