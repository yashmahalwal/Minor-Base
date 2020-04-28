import chalk from "chalk";
import figlet from "figlet";
import { resource as resourceJSON, endpoints } from "../schema.json";
import path from "path";
import { isValidResourceJSON, isValidEndpointsJSON } from "../../generic/types";
import { generateInstance } from "../../generic/utility/resource";
import { resourceToEndpoint, bodyFromResource } from "../../generic/utility/endpoints";

console.info(figlet.textSync("Nirikshak", { horizontalLayout: "full" }));

export function validate() {
    if (!isValidResourceJSON(resourceJSON)) throw new Error(`Invalid resource schema at ${path.resolve(__dirname, "..")}`);

    if (!isValidEndpointsJSON({ endpoints })) {
        throw new Error(`Invalid endpoints schema at ${path.resolve(__dirname, "..")}`);
    }

    console.info(chalk.green(`Schema validated. Proceeding`));
}

try {
    console.info(chalk.whiteBright.underline(`Action: Validating your schema file`));
    validate();
    console.info(`\n\n`);
} catch (error) {
    console.error(chalk.stderr.red(error.message));
    console.error(chalk.stderr.red(`Exiting program now`));
    process.exit();
}

// if (require.main === module) {
//     console.log("Here");
//     const sampleStudent = generateInstance(resourceJSON);

//     makePositiveGetRequest(
//         endpoints[0].endpoint,
//         endpoints[0].urls[0].url,
//         sampleStudent,
//         endpoints[0].urls[0].methods[0].cases[0] as Case
//     );
// const gen = generateInstance(resourceJSON);
// console.log("Generated Instance", gen);
// console.log("Instance validation", validateInstance(resourceJSON, gen));
// console.log("----------------------");

// console.log("Forward mapping, resource to endpoint");
// endpoints.forEach(endpoint => {
//     console.log("Endpoint", endpoint.endpoint);
//     endpoint.urls.forEach(url => {
//         console.log(url.url);
//         url.methods.forEach(method => {
//             console.log(method.method);
//             method.cases.forEach(c => {
//                 console.log(c.key);
//                 const obj = resourceToEndpoint(gen, url.url, c as Case);
//                 console.log(obj);
//                 console.log("Backward mapping from endpoint to resource");
//                 console.log(
//                     resourceFromCase(
//                         url.url,
//                         obj.url,
//                         (c as Case).request.body,
//                         (c as Case).response.body,
//                         obj.reqBody,
//                         obj.resBody
//                     )
//                 );
//                 console.log("\n");
//             });
//             console.log("\n");
//         });
//         console.log("\n");
//     });
//     console.log("\n");
// });

// traverseGraph(g, 3);
// }
