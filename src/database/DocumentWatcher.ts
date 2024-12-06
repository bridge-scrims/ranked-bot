import { EventEmitter } from "events"
import { ChangeStreamDocument, Long, UpdateDescription } from "mongodb"
import { Document, Model } from "mongoose"

export class DocumentWatcher<T extends Document> {
    protected events = new EventEmitter({ captureRejections: true })
    protected stream
    constructor(protected model: Model<T>) {
        this.events.on("error", console.error)

        try {
            this.stream = this.model.watch<T>(undefined, {
                fullDocument: "updateLookup",
                fullDocumentBeforeChange: "whenAvailable",
                hydrate: true,
            })

            this.stream.on("error", console.error)
            this.stream.on("change", (change: ChangeStreamDocument<T>) => {
                if (change.operationType === "insert") this.events.emit("insert", change.fullDocument)

                if (change.operationType === "update")
                    this.events.emit(
                        "update",
                        change.updateDescription,
                        change.documentKey._id,
                        change.fullDocument,
                    )

                if (change.operationType === "delete")
                    this.events.emit("delete", change.documentKey._id, change.fullDocumentBeforeChange)
            })
        } catch (err) {
            console.warn(`Failed to watch ${model.collection.name} collection because of ${err}!`)
        }
    }

    protected resolveValue(value: unknown) {
        if (value instanceof Long) return value.toString()
        return value
    }

    protected resolveDocument(rawDocument: T) {
        return new this.model(rawDocument)
    }

    on<E extends keyof Events<T>>(event: E, listener: (...args: Events<T>[E]) => unknown) {
        this.events.on(event, listener as (...args: unknown[]) => unknown)
        return this
    }
}

interface Events<T extends Document> {
    insert: [doc: T]
    update: [updateDescription: UpdateDescription<T>, id: T["_id"], doc?: T]
    delete: [id: T["_id"], doc?: T]
}
