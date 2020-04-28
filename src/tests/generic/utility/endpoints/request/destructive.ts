import { ResourceJSON } from "../../../types/resource";
import { resourceToEndpoint } from "..";
import supertest from "supertest";
import { CaseInfo } from "../graph";
import { RequestReturnValue } from ".";
import { generateInstance, mangleInstance } from "../../resource";

async function makeDestructivePostRequest(
    server: supertest.SuperTest<supertest.Test>,
    instance: Record<string, any>,
    caseInfo: CaseInfo,
    resourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;

    const { url, reqBody, resBody } = resourceToEndpoint(
        mangleInstance(resourceJSON, instance),
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.post(url).send(reqBody);

    const returnedInstance = instance;
    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makeDestructivePatchRequest(
    server: supertest.SuperTest<supertest.Test>,
    instance: Record<string, any>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;


    const m = mangleInstance(resourceJSON, instance);
    const { url, reqBody, resBody } = resourceToEndpoint(
        m,
        urlTemplate,
        endpoint,
        caseEntry
    );


    const { body, status } = await server.patch(url).send(reqBody);

    const returnedInstance = instance;

    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

async function makeDestructivePutRequest(
    server: supertest.SuperTest<supertest.Test>,
    instance: Record<string, any>,
    caseInfo: CaseInfo,
    resourceJSON
): Promise<RequestReturnValue> {
    const endpoint = caseInfo.endpoint.endpoint;
    const urlTemplate = caseInfo.url.url;
    const caseEntry = caseInfo.case;

    const { url, reqBody, resBody } = resourceToEndpoint(
        mangleInstance(resourceJSON, instance),
        urlTemplate,
        endpoint,
        caseEntry
    );
    const { body, status } = await server.put(url).send(reqBody);

    const returnedInstance = instance;
    return {
        resBodyExpected: resBody,
        resBodyActual: body,
        status,
        returnedInstance,
    };
}

export async function makeDestructiveRequest(
    server: supertest.SuperTest<supertest.Test>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON,
    instance: Record<string, any>
): Promise<RequestReturnValue> {
    const method = caseInfo.method.method;
    switch (method) {
        case "POST":
            return makeDestructivePostRequest(
                server,
                instance,
                caseInfo,
                resourceJSON
            );
        case "PUT":
            return makeDestructivePutRequest(
                server,
                instance,
                caseInfo,
                resourceJSON
            );
        case "PATCH":
            return makeDestructivePatchRequest(
                server,
                instance,
                caseInfo,
                resourceJSON
            );
        default:
            throw new Error(`Invalid method ${method}`);
    }
}
