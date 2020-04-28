import { ResourceJSON } from "../../../types/resource";
import { resourceToEndpoint } from "..";
import supertest from "supertest";
import { CaseInfo } from "../graph";
import { RequestReturnValue } from ".";
import { generateInstance } from "../../resource";

async function makeNegativeDeleteRequest(
    server: supertest.SuperTest<supertest.Test>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const instance = generateInstance(resourceJSON);
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;

    const { url, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.delete(url);
    const returnedInstance = instance;

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makeNegativeGetRequest(
    server: supertest.SuperTest<supertest.Test>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const instance = generateInstance(resourceJSON);
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;

    const { url, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.get(url);

    const returnedInstance = instance;

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makeNegativePostRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    instance: Record<string, any>,
    caseInfo: CaseInfo
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;

    const { url, reqBody, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.post(url).send(reqBody);

    const returnedInstance = instance;
    if (!collection.has(instance.id)) {
        throw new Error(`Negative POST for already existing instance`);
    }

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makeNegativePatchRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;
    const instance = generateInstance(resourceJSON);
    const { url, reqBody, resBody } = resourceToEndpoint(
        instance,
        urlTemplate,
        endpoint,
        caseEntry
    );

    const { body, status } = await server.patch(url).send(reqBody);

    const returnedInstance = instance;

    if (collection.has(returnedInstance.id)) {
        throw new Error(`Negative PATCH on existing resource`);
    }
    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

export async function makeNegativeRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON,
    instance: Record<string, any>
): Promise<RequestReturnValue> {
    const method = caseInfo.method.method;
    switch (method) {
        case "GET":
            return makeNegativeGetRequest(server, caseInfo, resourceJSON);
        case "DELETE":
            return makeNegativeDeleteRequest(server, caseInfo, resourceJSON);
        case "POST":
            return makeNegativePostRequest(
                server,
                collection,
                instance,
                caseInfo
            );
        case "PATCH":
            return makeNegativePatchRequest(
                server,
                collection,
                caseInfo,
                resourceJSON
            );
        default:
            throw new Error(`Invalid method ${method}`);
    }
}
