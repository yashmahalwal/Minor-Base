import {
    BasicFieldType,
    ResourceJSON,
    FieldBase,
    isValidFieldBase,
    validateNestedResourceJSON,
    Nullable,
    Optional
} from "../../types";
import faker from "faker";
import _ from "lodash";
// TODO: Test utility functions

/* Validation functions */

export function valdiateBasicField(f: BasicFieldType, data: any): boolean {
    if (typeof f === "string") {
        return typeof data === typeof _.get(faker, f)();
    } else
        return typeof data === typeof _.get(faker, f.field)(...(f.args || []));
}

export function validateFieldBase(f: FieldBase, data: any): boolean {
    if (f.nullable && data === null) return true;
    if (f.optional && data === undefined) return true;

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
            if (valdiateBasicField(t, data)) return true;
        }
        return false;
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
        const f = ResourceJSON[key];
        let field: FieldBase | Omit<ResourceJSON, "id">;
        if ("nestedField" in f) {
            if (f.optional && instance[key] === undefined) continue;
            if (f.nullable && instance[key] === null) continue;

            field = f.nestedField;
        } else field = ResourceJSON[key];

        if (isValidFieldBase(field)) {
            if (!validateFieldBase(field as FieldBase, instance[key])) {
                return false;
            }
        } else if (
            !validateInstance(field as Omit<ResourceJSON, "id">, instance[key])
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

export function generateFieldBaseData(
    f: FieldBase,
    enableRandomFieldControl: boolean = true
) {
    if (f.nullable && !(enableRandomFieldControl && faker.random.boolean()))
        return null;

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

export function generateInstance(
    ResourceJSON: Omit<ResourceJSON, "id">,
    enableRandomFieldControl: boolean = true
) {
    // Traverse resource json
    let record: Record<string, any> = {};

    for (const key in ResourceJSON) {
        let field: FieldBase | Omit<ResourceJSON, "id"> = {};
        if ("nestedField" in ResourceJSON[key]) {
            if (
                (ResourceJSON[key] as Optional).optional &&
                !(enableRandomFieldControl && faker.random.boolean())
            )
                continue;
            if (
                (ResourceJSON[key] as Nullable).nullable &&
                faker.random.boolean()
            ) {
                record[key] = null;

                continue;
            } else field = (ResourceJSON[key] as any).nestedField;
        } else {
            field = ResourceJSON[key];
        }

        if (isValidFieldBase(field)) {
            if (field.optional && faker.random.boolean()) continue;
            record[key] = generateFieldBaseData(
                field as FieldBase,
                enableRandomFieldControl
            );
        } else if (validateNestedResourceJSON(ResourceJSON[key])) {
            record[key] = generateInstance(field as Omit<ResourceJSON, "id">);
        }
    }
    return record;
}
