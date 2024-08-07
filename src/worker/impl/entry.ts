import QueueExecutor from "../../lib/executor";
import { createEntry } from "../../lib/impl/entry";
import colors from "colors";

const executor = new QueueExecutor<{ toInsert: any }>("database-executor")
    .executor(async (data) => {
        const media = await createEntry(data);
        return media;
    })
    .callback(() => console.debug(colors.green(`Finished creating entry.`)))
    .error((err) => console.error(colors.red(`Error occurred while creating entry.`), err))
    .interval(500);
export default executor;
