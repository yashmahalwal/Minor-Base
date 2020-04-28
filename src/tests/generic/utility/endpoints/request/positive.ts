import { ResourceJSON } from "../../../types/resource";
import { resourceToEndpoint, resourceFromCase } from "..";
import supertest from "supertest";
import { CaseInfo } from "../graph";
import { RequestReturnValue } from ".";
import * as faker from "faker";
import { generateInstance } from "../../resource";

async function makePositiveDeleteRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    instance: Record<string, any>,
    caseInfo: CaseInfo
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;
    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const { url, urlBase, reqBody, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.delete(url);

    const returnedInstance = resourceFromCase(
        urlTemplate,
        urlBase,
        reqBodyTemplate,
        resBodyTemplate,
        reqBody,
        resBody
    );

    if (!collection.delete(returnedInstance.id))
        throw new Error(
            `Invalid operation. Cannot delete non existent instance`
        );

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makePositiveGetRequest(
    server: supertest.SuperTest<supertest.Test>,
    instance: Record<string, any>,
    caseInfo: CaseInfo
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;
    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const { url, urlBase, reqBody, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.get(url);

    const returnedInstance = resourceFromCase(
        urlTemplate,
        urlBase,
        reqBodyTemplate,
        resBodyTemplate,
        reqBody,
        resBody
    );

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makePositivePostRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    instance: Record<string, any>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;
    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const { url, urlBase, reqBody, resBody } = resourceToEndpoint(
        generateInstance(resourceJSON),
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.post(url).send(reqBody);

    const returnedInstance = resourceFromCase(
        urlTemplate,
        urlBase,
        reqBodyTemplate,
        resBodyTemplate,
        reqBody,
        resBody
    );

    collection.set(returnedInstance.id, returnedInstance);

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makePositivePatchRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    instance: Record<string, any>,
    caseInfo: CaseInfo
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;
    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const { url, urlBase, reqBody, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );

    const { body, status } = await server.patch(url).send(reqBody);

    const returnedInstance = resourceFromCase(
        urlTemplate,
        urlBase,
        reqBodyTemplate,
        resBodyTemplate,
        reqBody,
        resBody
    );

    if (collection.has(returnedInstance.id)) {
        collection.set(returnedInstance.id, returnedInstance);
    } else
        throw new Error(
            `Invalid operation. Cannot patch non existent resource`
        );

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}
async function makePositivePutRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    instance: Record<string, any>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;
    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const useInstance = faker.random.boolean()
        ? instance
        : generateInstance(resourceJSON);

    const { url, urlBase, reqBody, resBody } = resourceToEndpoint(
        useInstance,
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.put(url).send(reqBody);

    const returnedInstance = resourceFromCase(
        urlTemplate,
        urlBase,
        reqBodyTemplate,
        resBodyTemplate,
        reqBody,
        resBody
    );

    collection.set(returnedInstance.id, returnedInstance);

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

export async function makePositiveRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON,
    instance: Record<string, any>
): Promise<RequestReturnValue> {
    const method = caseInfo.method.method;
    switch (method) {
        case "GET":
            return makePositiveGetRequest(server, instance, caseInfo);
        case "DELETE":
            return makePositiveDeleteRequest(
                server,
                collection,
                instance,
                caseInfo
            );
        case "POST":
            return makePositivePostRequest(
                server,
                collection,
                instance,
                caseInfo,
                resourceJSON
            );
        case "PUT":
            return makePositivePutRequest(
                server,
                collection,
                instance,
                caseInfo,
                resourceJSON
            );
        case "PATCH":
            return makePositivePatchRequest(
                server,
                collection,
                instance,
                caseInfo
            );
        default:
            throw new Error(`Invalid method ${method}`);
    }
}
