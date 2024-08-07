import emitter, { Events } from "..";

export const createEntry = async (data: { toInsert: any }) => {
    // ...

    await emitter.emitAsync(Events.COMPLETED_ENTRY_CREATION, data.toInsert);

    return data.toInsert;
};
