import { EndpointsJSON, Case } from "../../generic/types/endpoints";
import supertest from "supertest";
import * as Schema from "../schema.json";
import {
    makeGraph,
    resourceToEndpoint,
    compareResponseBodies,
    resourceFromCase,
    makeRequest,
} from "../../generic/utility/endpoints";
import app from "../../../server/app";
import {
    traverseGraph,
    parseNodeName,
    getFromMap,
} from "../../generic/utility/endpoints/graph";
import _ from "lodash";
import { generateInstance } from "../../generic/utility/resource";
import { getRandomElement } from "../../generic/utility/helper";

// TODO: put after delete, setup instances
const maxSteps = 4;
const setupInstances = 5;
const totalIterations = 3;

let server = supertest(app);
const collection: Map<string, Record<string, any>> = new Map();

const [graph, graphMap] = makeGraph(
    Schema.endpoints as EndpointsJSON["endpoints"]
);

for (let t = 0; t < totalIterations; t++) {
    describe(`iteration-${t}`, () => {
        for (let i = 1; i <= maxSteps; i++) {
            const graphMatrix = traverseGraph(graph, i);

            graphMatrix.forEach((pathArr) => {
                const path = pathArr
                    .map((p) => {
                        const n = parseNodeName(p);
                        if (!n) throw new Error("Invalid node name " + p);
                        return `${n?.method}-${n.key}-${n?.index}`;
                    })
                    .join(" ");

                describe(path, () => {
                    beforeAll(async () => {
                        // Do this on intentional error handling skip
                        collection.clear();
                        server = supertest(app);
                        try {
                            for (let i = 0; i < setupInstances; i++) {
                                const endpoint = Schema.endpoints[0].endpoint;
                                const urlTemplate =
                                    Schema.endpoints[0].urls[0].url;
                                const c = Schema.endpoints[0].urls[0].methods[2]
                                    .cases[0] as Case;
                                const reqBodyTemplate = c.request.body;
                                const resBodyTemplate = c.response.body;
                                const instance = generateInstance(
                                    Schema.resource
                                );
                                const {
                                    url,
                                    urlBase,
                                    reqBody,
                                    resBody,
                                } = resourceToEndpoint(
                                    instance,
                                    urlTemplate,
                                    endpoint,
                                    c
                                );

                                const { body, status } = await server
                                    .post(url)
                                    .set("Setup", "true")
                                    .send(reqBody);
                                if (
                                    status === 201 &&
                                    compareResponseBodies(
                                        body,
                                        resBody,
                                        c.response.body
                                    )
                                ) {
                                    const r = resourceFromCase(
                                        urlTemplate,
                                        urlBase,
                                        reqBodyTemplate,
                                        resBodyTemplate,
                                        reqBody,
                                        body
                                    );
                                    if (!collection.has(r.id))
                                        collection.set(r.id, r);
                                }
                            }
                        } catch (e) {
                            throw new Error(e);
                        }
                    });

                    let instance: Record<string, any> | null;
                    pathArr.forEach((nodeEntry) => {
                        const entry = getFromMap(nodeEntry, graphMap);
                        if (!entry)
                            throw new Error(
                                "No entry corresponding to " + nodeEntry
                            );

                        const nodeName = parseNodeName(nodeEntry);
                        test(`${nodeName.method}-${nodeName.key}-${nodeName.index}`, async () => {
                            if (!instance)
                                instance = getRandomElement(collection);

                            const {
                                status,
                                resBodyActual,
                                resBodyExpected,
                                returnedInstance,
                            } = await makeRequest(
                                server,
                                collection,
                                entry,
                                Schema.resource,
                                instance
                            );
                            const statusExpected: number | number[] =
                                entry.case.response.status;
                            const resBodyTemplate = entry.case.response.body;

                            // console.log(instance);
                            // console.log("Expected", resBodyExpected);
                            // console.log("actual", resBodyActual);

                            // console.log(nodeName);
                            // console.log("Actual", resBodyActual);
                            // console.log("Expected", resBodyExpected);
                            // console.log("Template", resBodyTemplate);

                            expect(status).toMatchStatus(statusExpected);
                            expect(resBodyActual).toMatchBody({
                                template: resBodyTemplate,
                                resBodyExpected,
                            });
                            instance = returnedInstance;
                        });
                    });
                });
            });
        }
    });
}
