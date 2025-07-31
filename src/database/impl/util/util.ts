import mongoose from "mongoose"

import { getModelForClass, ModelOptions, ReturnModelType, Severity } from "@typegoose/typegoose"
import { AnyParamConstructor, BeAnObject, DocumentType, IModelOptions } from "@typegoose/typegoose/lib/types"
import mongooseLong from "mongoose-long"
import { DocumentCache } from "./DocumentCache"
import { DocumentWatcher } from "./DocumentWatcher"

export function Document(name: string, collection: string) {
    return ModelOptions({
        schemaOptions: { versionKey: false, collection },
        options: { customName: name, allowMixed: Severity.ALLOW },
    })
}

declare module "mongoose" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Model<TRawDocType, TQueryHelpers, TInstanceMethods, TVirtuals, THydratedDocumentType> {
        _watcher?: DocumentWatcher<TRawDocType>
        watcher: () => DocumentWatcher<TRawDocType>
    }
}

export type CachedModel<U extends AnyParamConstructor<unknown>, QueryHelpers = BeAnObject> = ReturnModelType<
    U,
    QueryHelpers
> & {
    cache: DocumentCache<DocumentType<InstanceType<U>>>
    reloadCache: () => Promise<void>
}

const reloads = new Array<() => Promise<void>>()
export async function reloadCache() {
    await Promise.all(reloads.map((v) => v()))
}

function reloadCacheFunction<U extends AnyParamConstructor<unknown>>(model: CachedModel<U>) {
    const reload = () =>
        model.find().then((result) => {
            const docs = result as DocumentType<InstanceType<U>>[]

            const newKeys = new Set(docs.map((v) => v.id as string))
            Array.from(model.cache.keys())
                .filter((key) => !newKeys.has(key))
                .forEach((key) => model.cache.delete(key))

            docs.forEach((doc) => {
                const id = doc.id as string
                const existing = model.cache.get(id)
                if (!existing || JSON.stringify(existing) !== JSON.stringify(doc)) model.cache.set(id, doc)
            })

            model.cache.__setInitialized()
        })

    reloads.push(reload)
    return reload
}

export function modelClass<U extends AnyParamConstructor<unknown>, QueryHelpers = BeAnObject>(
    cl: U,
    options?: IModelOptions,
): ReturnModelType<U, QueryHelpers> {
    const model: ReturnModelType<U, QueryHelpers> = getModelForClass(cl, options)
    model.watcher = () => {
        if (!model._watcher) model._watcher = new DocumentWatcher(model)
        return model._watcher
    }
    return model
}

let warned = false
export function modelClassCached<U extends AnyParamConstructor<unknown>>(clazz: U): CachedModel<U> {
    const model = modelClass(clazz) as CachedModel<U>
    const cache = (model.cache = new DocumentCache())
    model.reloadCache = reloadCacheFunction(model)

    if (process.env["NODE_ENV"] === "production") {
        model
            .watcher()
            .on("delete", (id) => cache.delete(`${id}`))
            .on("insert", (doc) => cache.set(doc.id as string, doc))
            .on("update", (_, __, fullDoc) => {
                if (fullDoc) {
                    cache.set(fullDoc.id as string, fullDoc)
                }
            })
    } else {
        if (!warned) {
            console.warn("DocumentWatcher is disabled in development mode!")
            warned = true
        }

        model.db.once("open", () => {
            const interval = setInterval(() => model.reloadCache().catch(console.error), 1000)
            model.db.once("close", () => clearInterval(interval))
        })
    }

    model.db.on("open", () => model.reloadCache().catch(console.error))
    return model
}

mongooseLong(mongoose)
mongoose.Schema.Types.Long.get((v?: mongoose.Types.Long) => v?.toString())
