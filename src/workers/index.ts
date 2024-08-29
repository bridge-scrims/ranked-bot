/**
 * @description Handles all Discord worker related operations.
 */

import { Worker } from "../types/index";
import { fetchWorkers } from "./impl/lib/fetchWorkers";
import { initializeWorkers } from "./impl/lib/initializeWorkers";

export const workers: Worker[] = [];

export const init = async (guildId: string) => {
    await fetchWorkers(guildId);
    await initializeWorkers(guildId);
};
