import { DocumentType, ModelType } from "@typegoose/typegoose/lib/types"
import { EventEmitter } from "events"
import { ChangeStreamDocument, UpdateDescription } from "mongodb"
import { Document } from "mongoose"

export class DocumentWatcher<T, V extends Document = DocumentType<T>> {
    protected events = new EventEmitter({ captureRejections: true })
    protected stream
    constructor(protected model: ModelType<T>) {
        this.events.on("error", console.error)
        this.model.db.on("open", () => this.events.emit("open"))

        try {
            this.stream = this.model.watch<V>(undefined, {
                fullDocument: "updateLookup",
                fullDocumentBeforeChange: "whenAvailable",
                hydrate: true,
            })

            this.stream.on("error", console.error)
            this.stream.on("change", (change: ChangeStreamDocument<V>) => {
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

    protected resolveDocument(rawDocument: V) {
        return new this.model(rawDocument)
    }

    on<E extends keyof Events<V>>(event: E, listener: (...args: Events<V>[E]) => unknown) {
        this.events.on(event, listener as (...args: unknown[]) => unknown)
        return this
    }
}

interface Events<T extends Document> {
    open: []
    insert: [doc: T]
    update: [updateDescription: UpdateDescription, id: unknown, doc?: T]
    delete: [id: unknown, doc?: T]
}
