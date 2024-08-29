import { events } from "../events";
import { Worker } from "../../../types/index";

export const registerEvents = async (worker: Worker) => {
    for (const event of events) {
        if (event.default.once) {
            worker.client.once(event.default.name, event.default.execute);
            continue;
        }

        worker.client.on(event.default.name, event.default.execute);
    }
};
