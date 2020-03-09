import { Type, Root } from "@apollo/protobufjs";
import * as faker from "faker";

const Timestamp = "google.protobuf.Timestamp";
const Any = "google.protobuf.Any";
const Struct = "google.protobuf.Struct";
const NullValue = "google.protobuf.NullValue";
const Empty = "google.protobuf.Empty";

// Mocking ID
const mockId = () => faker.random.uuid();

// Mocking types from google.protobuf
const googleProtobufMocks = (type: string) => {
    switch (type) {
        case Timestamp:
            return {
                seconds: faker.date.recent().getTime() / 1000
            };
        case Any:
            const randomKeys = Object.keys(faker.random);
            return faker.random[
                randomKeys[Math.floor(Math.random() * randomKeys.length)]
            ]();
        case Struct:
            return faker.random.objectElement();
        case NullValue:
            return null;
        case Empty:
            return {};
    }
};

// Mocking primitive types
const primtiveMocks = (type: string) => {
    if (type.includes("string")) return faker.random.word();
    if (type.includes("uint")) return faker.random.number({ min: 0 });
    if (type.includes("int") || type.includes("fixed"))
        return faker.random.number();
    if (type.includes("float") || type.includes("double"))
        return faker.random.number({ precision: Math.random() });
    if (type.includes("bool")) return faker.random.boolean();
    if (type.includes("byte")) {
        const data = faker.lorem.lines();
        const buffer = new Buffer(data);
        return buffer.toString("base64");
    }
};

export function MakeJSONSchema(root: Root, resource: Type) {
    // Take the resource and traverse
    const { fields: fieldBase } = resource.toJSON();
    // const fields = mapValues(fieldBase, ({ type }) => {

    //     // Type can be a simple type
    //     // Or a message
    //     // Or an enum

    //     try {
    //         const t = root.lookupTypeOrEnum(type);
    //         console.log(t.name);
    //         const f = MakeJSONSchema(root, t);
    //         return f;
    //     } catch (e) {
    //         return type;
    //     }
    // });
    return fieldBase;
}

export function generateRandomResource(root: Root, resource: Type) {
    console.log(resource.toJSON());
    console.log(MakeJSONSchema(root, resource));
}
