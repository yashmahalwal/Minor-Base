import {  FieldBase } from "./../../types/resource";
import faker from "faker";
import { BodyBase } from "./../../types/endpoints";
import {
    Case,
    ResourceTemplateString,
    isTemplateString,
    Body,
    isValidBodyBase,
    isValidFieldBase,
    isValidBodyRecursion,
    BodyRecursion,
} from "../../types";
import _ from "lodash";
import { generateFieldBaseData } from "../resource";

export function populateURLTemplate(
    urlTemplate: string,
    instance: Record<string, any>
) {
    const urlArr = urlTemplate.split("/");
    return urlArr
        .map((urlItem) =>
            isTemplateString(urlItem)
                ? getValueFromResource(instance, urlItem)
                : urlItem
        )
        .join("/");
}

export function getValueFromResource(
    resource: Record<string, any>,
    template: ResourceTemplateString
) {
    if (!isTemplateString(template)) return null;
    if (template === "{resource}") return resource;
    const templateStringSimplified = template
        .slice(1, template.length - 1)
        .replace("resource.", "");
    return _.get(resource, templateStringSimplified);
}

export function bodyBaseFromResource(
    resource: Record<string, any>,
    template: BodyBase
) {
    if (template === null) return null;
    if (isTemplateString(template))
        return getValueFromResource(resource, template);
    if (isValidFieldBase(template)) return generateFieldBaseData(template);
}

export function bodyRecursionFromResource(
    resource: Record<string, any>,
    template: BodyRecursion,
    enableRandomizationOption: boolean
) {
    const returnValue: Record<string, any> = {};
    // Body recursion has keys
    for (const key in template) {
        let f: BodyBase | BodyRecursion;

        if (
            template[key] &&
            typeof template[key] === "object" &&
            "field" in (template as any)[key]
        ) {
            if (
                enableRandomizationOption &&
                template[key]["optional"] &&
                faker.random.boolean()
            )
                continue;
            f = template[key]["field"];
        } else f = template[key] as BodyBase | BodyRecursion;

        if (isValidBodyBase(f))
            returnValue[key] = bodyBaseFromResource(resource, f);
        else if (isValidBodyRecursion(f))
            returnValue[key] = bodyRecursionFromResource(
                resource,
                f,
                enableRandomizationOption
            );
    }
    return returnValue;
}

export function bodyFromResource(
    resource: Record<string, any>,
    template: Body,
    enableRandomizationOption: boolean
): any {
    if (isValidBodyBase(template))
        return bodyBaseFromResource(resource, template);
    else if (isValidBodyRecursion(template))
        return bodyRecursionFromResource(
            resource,
            template,
            enableRandomizationOption
        );
}

export function resourceToEndpoint(
    resource: Record<string, any>,
    urlTemplate: string,
    endpoint: string,
    caseEntry: Case
) {
    // Step 1, generate URL
    const url = makeURL(resource, urlTemplate, endpoint);
    const urlBase = populateURLTemplate(urlTemplate, resource);

    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const reqBody = bodyFromResource(resource, reqBodyTemplate, true);
    const resBody = bodyFromResource(resource, resBodyTemplate, false);
    return { url, reqBody, resBody, urlBase };
}

function extractFromBodyBase(template: BodyBase, data: any) {
    const partialRecord: Record<string, any> = {};
    if (isTemplateString(template)) {
        if (template === "{resource}") return data;
        if (data !== undefined) {
            const path = template
                .slice(1, template.length - 1)
                .replace("resource.", "");
            _.set(partialRecord, path, data);
        }
    }
    return partialRecord;
}

function extractFromBodyRecursion(
    template: BodyRecursion,
    data: Record<string, any>
) {
    let partialRecord: Record<string, any> = {};
    for (const key in template) {
        let t: BodyRecursion | BodyBase;
        if (
            template[key] &&
            typeof template[key] === "object" &&
            "field" in (template as any)[key]
        ) {
            if (template[key]["field"].optional && data[key] === "undefined")
                continue;
            t = template[key]["field"];
        } else t = template[key] as BodyRecursion | BodyBase;

        if (isValidBodyBase(t))
            partialRecord = {
                ...partialRecord,
                ...extractFromBodyBase(t, data[key]),
            };
        else if (isValidBodyRecursion(t))
            partialRecord = {
                ...partialRecord,
                ...extractFromBodyRecursion(t, data[key]),
            };
    }

    return partialRecord;
}

function extractFromBody(template: Body, data: any) {
    let partialRecord: Record<string, any> = {};
    // Traverse template
    if (isValidBodyBase(template)) return extractFromBodyBase(template, data);
    else if (isValidBodyRecursion(template))
        return extractFromBodyRecursion(template, data);
    return partialRecord;
}

export function resourceFromCase(
    urlTemplate: string,
    url: string,
    reqBodyTemplate: Body,
    resBodyTemplate: Body,
    reqBody: Record<string, any>,
    resBody: Record<string, any>
) {
    let resource: Record<string, any> = {};

    const reqPartialRecord = extractFromBody(reqBodyTemplate, reqBody);
    const resPartialRecord = extractFromBody(resBodyTemplate, resBody);

    resource = { ...reqPartialRecord, ...resPartialRecord };

    // At last, traverse the url. URL params override request and response params
    const urlTemplateArray = urlTemplate.split("/");
    const urlArray = url.split("/");

    if (urlTemplateArray.length !== urlArray.length)
        throw new Error("Invalid url. Does not match the template");
    for (let i = 0; i < urlArray.length; i++) {
        if (isTemplateString(urlTemplateArray[i])) {
            if (urlTemplateArray[i] === "resource")
                throw new Error(
                    "Invalid path property. URL cannot contain the resource"
                );
            const path = urlTemplateArray[i]
                .slice(1, urlTemplateArray[i].length - 1)
                .replace("resource.", "");
            _.set(resource, path, urlArray[i]);
        }
    }

    return resource;
}

export function makeURL(
    instance: Record<string, any>,
    urlTemplate: string,
    endpoint: string
) {
    const u = populateURLTemplate(urlTemplate, instance);
    return `${endpoint}${u}`;
}

export function compareResponseBodies(
    resFromServer: any,
    resExpected: any,
    resSchema: Case["response"]["body"]
) {
    // Traverse the resSchema and validate the fields as needed
    // Res expected has all nullable and optional fields too. Hence a special function

    if (isValidBodyBase(resSchema)) {
        if (resSchema === null) {
            if (resFromServer === null && resExpected === null) return true;
            if (
                resFromServer &&
                typeof resFromServer === "object" &&
                !Object.keys(resFromServer).length
            )
                return true;
        }
        if (isTemplateString(resSchema)) {
            // Use a special validation function
            // Just remove optional fields from resExpected
            return _.isEqual(resFromServer, resExpected);
        }
        if (isValidFieldBase(resSchema)) {
            if ((resSchema as FieldBase).nullable && resFromServer === null)
                return true;
            if (
                (resSchema as FieldBase).optional &&
                resFromServer === undefined
            )
                return true;
        }
        // Works as values are directly from faker.
        return _.isEqual(resFromServer, resExpected);
    }
    // The resSchema is body recursion
    if (isValidBodyRecursion(resSchema)) {
        for (const key in resSchema) {
            let s = resSchema[key];
            let resFromServerValue = resFromServer[key];
            let resExpectedValue = resExpected[key];

            if (s && typeof s === "object" && "field" in s) {
                // Only optional allowed in  body recursion part
                if (!s.optional && resFromServerValue === undefined) {
                    return false;
                }

                resFromServerValue = resFromServerValue.field;
                resExpectedValue = resFromServerValue.field;
                s = s.field;
            }

            if (
                !compareResponseBodies(
                    resFromServerValue,
                    resExpectedValue,
                    s as Case["response"]["body"]
                )
            )
                return false;
        }
        return true;
    }

    throw new Error(`${resSchema} is not a valid response schema`);
}

export * from "./graph";
export * from "./request";
