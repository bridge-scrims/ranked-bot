import CryptoJS from "crypto-js"

const SECRET = process.env["ENCRYPTION_SECRET"]!
const CONFIG = { mode: CryptoJS.mode.ECB }

export function encrypt(message: string) {
    return CryptoJS.AES.encrypt(message, SECRET, CONFIG).toString()
}

export function decrypt(cipher: string) {
    return CryptoJS.AES.decrypt(cipher, SECRET, CONFIG).toString(CryptoJS.enc.Utf8)
}
