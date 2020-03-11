import { resource as resourceJSON, endpoints } from "../schema.json";
import {
    generateInstance,
    validateInstance
} from "../../generic/utility/resource";
import path from "path";
import {
    isValidResourceJSON,
    isValidEndpointsJSON,
    Case
} from "../../generic/types";
import {
    resourceToEndpoint,
    resourceFromCase
} from "../../generic/utility/endpoints";
if (!isValidResourceJSON(resourceJSON))
    throw new Error(
        `Invalid resource schema at ${path.resolve(__dirname, "..")}`
    );

if (!isValidEndpointsJSON({ endpoints })) {
    throw new Error(
        `Invalid endpoints schema at ${path.resolve(__dirname, "..")}`
    );
}

const gen = generateInstance(resourceJSON);
console.log("Generated Instance", gen);
console.log("Instance validation", validateInstance(resourceJSON, gen));
console.log("----------------------");

console.log("Forward mapping, resource to endpoint");
endpoints.forEach(endpoint => {
    console.log("Endpoint", endpoint.endpoint);
    endpoint.urls.forEach(url => {
        console.log(url.url);
        url.methods.forEach(method => {
            console.log(method.method);
            method.cases.forEach(c => {
                console.log(c.key);
                const obj = resourceToEndpoint(gen, url.url, c as Case);
                console.log(obj);
                console.log("Backward mapping from endpoint to resource");
                console.log(
                    resourceFromCase(
                        url.url,
                        obj.url,
                        (c as Case).request.body,
                        (c as Case).response.body,
                        obj.reqBody,
                        obj.resBody
                    )
                );
                console.log("\n");
            });
            console.log("\n");
        });
        console.log("\n");
    });
    console.log("\n");
});
