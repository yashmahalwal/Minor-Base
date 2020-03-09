import { BasicFieldType, ResourceJSON, FieldBase } from "./types";
import faker from "faker";
import _ from "lodash";
// TODO: Test utility functions

/* Validation functions */

export function isValidBasicField(field: any): field is BasicFieldType {
    if (!field) return false;
    if (typeof field === "string") return Boolean(_.get(faker, field));
    else if ("field" in field) return Boolean(_.get(faker, field["field"]));
    return false;
}

export function isValidFieldBase(base: any): base is FieldBase {
    if (!base) return false;
    if ("type" in base) {
        if (Array.isArray(base["type"])) {
            for (let field of base["type"]) {
                if (!isValidBasicField(field)) return false;
            }
            return true;
        } else return isValidBasicField(base["type"]);
    }
}

function validateNestedResourceJSON(json: Record<string, any>): boolean {
    for (const key in json) {
        // f can be a resource type or a base field type
        const f = json[key];
        if (typeof f !== "object") return false;

        if (!isValidFieldBase(f) && !validateNestedResourceJSON(f))
            return false;
    }

    return true;
}

export function isValidResourceJSON(json: any): json is ResourceJSON {
    if (typeof json !== "object") return false;
    // Traverse the json object
    if (!("id" in json)) return false;
    const idField = json["id"];
    if (idField.nullable || idField.plural || idField.type !== "random.uuid")
        return false;
    for (const key in json) {
        // f can be a resource type or a base field type
        const f = json[key];
        if (typeof f !== "object") return false;

        if (!isValidFieldBase(f) && !validateNestedResourceJSON(f))
            return false;
    }

    return true;
}

export function valdiateBasicField(f: BasicFieldType, data: any): boolean {
    if (typeof f === "string") {
        return typeof data === typeof _.get(faker, f)();
    } else
        return typeof data === typeof _.get(faker, f.field)(...(f.args || []));
}

export function validateFieldBase(f: FieldBase, data: any): boolean {
    if (f.nullable && data === null) return true;

    // Plural
    if (f.plural && Array.isArray(data)) {
        const o = Object.assign({}, f);
        delete o.plural;
        for (const datum of data) {
            if (!validateFieldBase(o, datum)) return false;
        }
        return true;
    }

    // Multiple options
    if (Array.isArray(f.type)) {
        for (const t of f.type) {
            if (!valdiateBasicField(t, data)) return false;
        }
        return true;
    } else {
        return valdiateBasicField(f.type, data);
    }
}

export function validateInstance(
    ResourceJSON: Omit<ResourceJSON, "id"> & Partial<Pick<ResourceJSON, "id">>,
    instance: Record<string, any>
): boolean {
    // Traverse the resource json
    for (const key in ResourceJSON) {
        if (isValidFieldBase(ResourceJSON[key])) {
            if (
                !validateFieldBase(
                    ResourceJSON[key] as FieldBase,
                    instance[key]
                )
            )
                return false;
        } else if (
            !validateInstance(
                ResourceJSON[key] as Omit<ResourceJSON, "id">,
                instance[key]
            )
        )
            return false;
    }

    return true;
}

/* Data generation */

export function generateBasicFieldData(f: BasicFieldType) {
    if (typeof f === "string") return _.get(faker, f)();

    return _.get(faker, f.field)(...(f.args || []));
}

export function generateFieldBaseData(f: FieldBase) {
    if (f.nullable && faker.random.boolean()) return null;

    if (f.plural) {
        const o = Object.assign({}, f);
        delete o.plural;

        let iterations = faker.random.number({
            min: 1,
            max: 10,
            precision: 1
        });
        const dataArray: any[] = [];
        while (iterations--) {
            dataArray.push(generateFieldBaseData(o));
        }
        return dataArray;
    }

    let type: any;
    if (Array.isArray(f["type"])) {
        const arr = f["type"];
        type = generateBasicFieldData(
            arr[Math.floor(arr.length * Math.random())]
        );
    } else type = generateBasicFieldData(f["type"]);
    return type;
}

export function generateInstance(ResourceJSON: Omit<ResourceJSON, "id">) {
    // Traverse resource json
    let record: Record<string, any> = {};

    for (const key in ResourceJSON) {
        if (isValidFieldBase(ResourceJSON[key])) {
            record = {
                ...record,
                [key]: generateFieldBaseData(ResourceJSON[key] as FieldBase)
            };
        } else {
            record = {
                ...record,
                [key]: generateInstance(
                    ResourceJSON[key] as Omit<ResourceJSON, "id">
                )
            };
        }
    }

    return record;
}
