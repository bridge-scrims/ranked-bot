import { Glicko2 } from "glicko2";

export const apiURL = "https://api.scrims.network/v1";
export const ranking = new Glicko2({
    tau: 0.9,
    rating: 1000,
    rd: 16 * 4.69,
    vol: 0.06,
});
