import _ from "lodash";
import faker from "faker";
import { Nullable, Optional } from ".";
/* Resource */

// Mapping with faker API
export type BasicFieldType = string | { field: string; args?: any[] };
export function isValidBasicField(field: any): field is BasicFieldType {
    if (!field) return false;
    if (typeof field === "string") return Boolean(_.get(faker, field));
    else if ("field" in field) return Boolean(_.get(faker, field["field"]));
    return false;
}

// Type to be used for node resource attribute
export type FieldBase = {
    type: BasicFieldType | BasicFieldType[];
    plural?: boolean; // Default - false
} & Nullable &
    Optional;

export function isValidFieldBase(base: any): base is FieldBase {
    if (!base || typeof base !== "object") return false;
    if ("type" in base) {
        if (Array.isArray(base["type"])) {
            for (let field of base["type"]) {
                if (!isValidBasicField(field)) return false;
            }
            return true;
        } else return isValidBasicField(base["type"]);
    }
}

// Interface for schema.resouce

export function validateNestedResourceJSON(
    _json: Record<string, any>
): boolean {
    const json = Object.assign({}, _json);
    if (json.optional) delete json.optional;
    if (json.nullable) delete json.nullable;
    for (const key in json) {
        // f can be a resource type or a base field type
        const f = json[key];
        if (typeof f !== "object") return false;

        if (f.nestedField) {
            const o = Object.assign({}, f.nestedField);
            delete o.optional;
            delete o.nullable;
            if (!isValidFieldBase(o) && !validateNestedResourceJSON(o))
                return false;
        }

        if (!isValidFieldBase(f) && !validateNestedResourceJSON(f))
            return false;
    }
    return true;
}

export function validateId(json: any): boolean {
    if (!json) return false;
    if (!("id" in json)) return false;
    const idField = json["id"];
    if (idField.nullable || idField.plural || idField.type !== "random.uuid")
        return false;
    return true;
}

export function isValidResourceJSON(json: any): json is ResourceJSON {
    if (typeof json !== "object") return false;
    // Traverse the json object
    if (!validateId(json)) return false;

    return validateNestedResourceJSON(json);
}

// TODO: Add plural and optional in nested fields
export interface ResourceJSON {
    id: FieldBase;
    [key: string]:
        | FieldBase
        | Omit<ResourceJSON, "id">
        | ({
              nestedField: Omit<ResourceJSON, "id">;
          } & Nullable &
              Optional);
}
