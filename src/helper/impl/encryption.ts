import CryptoJS from "crypto-js";
import { env } from "../../env";

export const encrypt = (data: string): string => {
    const encrypted = CryptoJS.AES.encrypt(data, env.SALT_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.enc.Hex.parse("12300000000000000000000000040700"),
    });

    return encrypted.toString();
};
