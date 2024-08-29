import CryptoJS from "crypto-js";
import { env } from "../../env";

export const decrypt = (data: string): string => {
    const decrypted = CryptoJS.AES.decrypt(data, env.SALT_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.enc.Hex.parse("12300000000000000000000000040700"),
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};
