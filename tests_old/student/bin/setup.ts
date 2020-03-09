import { SetupConfig } from "./../../generic/types";
import { load, Root } from "@apollo/protobufjs";
import * as path from "path";
import { generateRandomResource } from "../../generic/randomResource";
// Function to read proto resource

const proto = path.resolve(__dirname, "..", "proto", "Resource.proto");

// Node JS waits for event loop to empty the queue
// The callback will be executed
export async function Setup<
    T extends Record<string, any> = { [key: string]: any }
>() {
    let r: SetupConfig<T>;
    let root: Root;
    try {
        root = await load(proto);
    } catch (e) {
        console.error(e);
        process.exit();
    }

    const resource = root.lookupType("Resource");
    function validate(sample: Record<string, any>) {
        // Takes the sample and checks if the record is a valid resource
        const error = resource.verify(sample);
        // If an error is encountered, throw the error. Jest includes it in the log
        if (error) throw new Error(error);

        return true;
    }

    function generate() {
        generateRandomResource(root, resource);
        return {} as T;
    }

    generate();

    r = { validate, generate };
}

Setup();
