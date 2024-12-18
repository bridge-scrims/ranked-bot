import {
    Collection,
    PermissionOverwrites,
    PermissionsBitField,
    type OverwriteType,
    type PermissionResolvable,
} from "discord.js"

export interface OverwriteResolvable {
    id: string
    type: OverwriteType
    allow?: PermissionResolvable
    deny?: PermissionResolvable
}

interface OverwriteData {
    id: string
    type: OverwriteType
    allow: PermissionsBitField
    deny: PermissionsBitField
}

function standardize(resolvable: OverwriteResolvable): OverwriteData {
    return {
        id: resolvable.id,
        type: resolvable.type,
        allow: new PermissionsBitField(resolvable.allow),
        deny: new PermissionsBitField(resolvable.deny),
    }
}

export function mergePermissions(
    base: Collection<string, PermissionOverwrites> | null,
    overwrites: OverwriteResolvable[],
) {
    const permissions = new Collection(base?.map((v, key): [string, OverwriteData] => [key, standardize(v)]))
    for (const overwrite of overwrites) {
        const existing = permissions?.get(overwrite.id)
        if (existing) {
            if (overwrite.allow) existing.allow?.add(overwrite.allow)
            if (overwrite.deny) {
                existing.allow?.remove(overwrite.deny)
                existing.deny?.add(overwrite.deny)
            }
        } else {
            permissions.set(overwrite.id, standardize(overwrite))
        }
    }
    return permissions
}
