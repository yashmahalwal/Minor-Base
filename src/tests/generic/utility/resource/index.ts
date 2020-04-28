import {
    BasicFieldType,
    ResourceJSON,
    FieldBase,
    isValidFieldBase,
    validateNestedResourceJSON,
    Nullable,
    Optional,
} from "../../types";
import faker from "faker";
import _ from "lodash";
import { getRandomElement } from "../helper";
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

export function generateFieldBaseData(f: FieldBase) {
    if (f.plural) {
        const o = Object.assign({}, f);
        delete o.plural;

        let iterations = faker.random.number({
            min: 1,
            max: 10,
            precision: 1,
        });
        const dataArray: any[] = [];
        while (iterations--) {
            dataArray.push(generateFieldBaseData(o));
        }
        return dataArray;
    }

    if (f.nullable && faker.random.boolean()) return null;
    // Field.optional is already covered
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
        let field: FieldBase | Omit<ResourceJSON, "id"> = {};
        if ("nestedField" in ResourceJSON[key]) {
            if (
                (ResourceJSON[key] as Optional).optional &&
                faker.random.boolean()
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
            record[key] = generateFieldBaseData(field as FieldBase);
        } else if (validateNestedResourceJSON(ResourceJSON[key])) {
            record[key] = generateInstance(field as Omit<ResourceJSON, "id">);
        }
    }
    return record;
}

/* Invalid resource generation for destructive testing */
export function generateDestructiveBasicFieldData(f: BasicFieldType) {
    const filteredKeys = (...keys: Array<keyof typeof map>) =>
        Object.keys(map).filter((key: keyof typeof map) => !keys.includes(key));

    const getRandomType = (...exclude: Array<keyof typeof map>) =>
        faker.random.arrayElement(filteredKeys(...exclude));

    const map: Record<
        | "string"
        | "boolean"
        | "number"
        | "undefined"
        | "object"
        | "null"
        | "function",
        () => string | boolean | number | undefined | null | object
    > = {
        function: function (this: typeof map) {
            return this[getRandomType("function")]();
        },
        string: () => faker.random.word(),
        boolean: () => faker.random.boolean(),
        number: () => faker.random.number(),
        undefined: () => undefined,
        object: function (this: typeof map) {
            const size = faker.random.number({ min: 1, max: 10, precision: 1 });
            const o: object = {};
            for (let i = 0; i < size; i++) {
                o[faker.random.word()] = this[getRandomType("object")]();
            }

            return o;
        },
        null: () => null,
    };

    let field: string = typeof f === "string" ? f : f.field;
    let temp = typeof _.get(faker, field)();

    // Do not generate invalid ID's
    if (field === "random.uuid") return faker.random.uuid();

    switch (temp) {
        case "string":
            return map[getRandomType("string")]();
        case "symbol":
            return map[getRandomType()]();
        case "undefined":
            return map[getRandomType("undefined", "null")]();
        case "bigint":
            return map[getRandomType("number")]();
        case "boolean":
            return map[getRandomType("boolean")]();
        case "function":
            return map[getRandomType("function")]();
        case "number":
            return map[getRandomType("number")]();
        case "object":
            return map[getRandomType("object")]();
    }
}

export function generateDestructiveFieldBaseData(f: FieldBase) {
    if (f.plural) {
        const o = Object.assign({}, f);
        delete o.plural;

        let iterations = faker.random.number({
            min: 1,
            max: 10,
            precision: 1,
        });
        const dataArray: any[] = [];
        while (iterations--) {
            dataArray.push(generateDestructiveFieldBaseData(o));
        }
        return dataArray;
    }

    if (f.nullable && faker.random.boolean()) return null;
    // Field.optional is already covered
    let type: any;
    if (Array.isArray(f["type"])) {
        const arr = f["type"];
        type = generateBasicFieldData(
            arr[Math.floor(arr.length * Math.random())]
        );
    } else type = generateDestructiveBasicFieldData(f["type"]);
    return type;
}

export function generateDestructiveInstance(
    ResourceJSON: Omit<ResourceJSON, "id">
) {
    // Traverse resource json
    let record: Record<string, any> = {};

    for (const key in ResourceJSON) {
        let field: FieldBase | Omit<ResourceJSON, "id"> = {};
        if ("nestedField" in ResourceJSON[key]) {
            if (
                (ResourceJSON[key] as Optional).optional &&
                faker.random.boolean()
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
            record[key] = generateDestructiveFieldBaseData(field as FieldBase);
        } else if (validateNestedResourceJSON(ResourceJSON[key])) {
            record[key] = generateDestructiveInstance(
                field as Omit<ResourceJSON, "id">
            );
        }
    }
    return record;
}

/* Mangling existing resources */
export function mangleInstance(
    ResourceJSON: Omit<ResourceJSON, "id"> & Partial<Pick<ResourceJSON, "id">>,
    instance: Record<string, any>
) {
    // Traverse the resource json
    const mangled: Record<string, any> = {};

    for (const key in ResourceJSON) {
        const f = ResourceJSON[key];
        let field: FieldBase | Omit<ResourceJSON, "id">;
        if ("nestedField" in f) {
            if (f.optional && instance[key] === undefined) continue;
            if (f.nullable && instance[key] === null) {
                mangled[key] = null;
                continue;
            }

            field = f.nestedField;
        } else field = ResourceJSON[key];

        if (isValidFieldBase(field)) {
            mangled[key] = generateDestructiveFieldBaseData(field);
        } else {
            mangled[key] = mangleInstance(field, instance[key]);
        }
    }
    if ("id" in instance) mangled.id = instance.id;
    return mangled;
}
