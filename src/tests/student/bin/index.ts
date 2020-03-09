import Schema from "../schema.json";
import {
    isValidResourceJSON,
    generateInstance,
    validateInstance
} from "../../generic/utility";
import path from "path";
if (!isValidResourceJSON(Schema))
    throw new Error(`Invalid schema at ${path.resolve(__dirname, "..")}`);

const gen = generateInstance(Schema);
console.log(validateInstance(Schema, gen));
