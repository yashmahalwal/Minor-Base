import { ResourceJSON } from "./../../types/resource";
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
    Optional
} from "../../types";
import _ from "lodash";
import { generateFieldBaseData, validateInstance } from "../resource";

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
    template: BodyBase,
    enableRandomizationOption: boolean
) {
    if (template === null) return null;
    if (isTemplateString(template))
        return getValueFromResource(resource, template);
    if (isValidFieldBase(template))
        return generateFieldBaseData(template, enableRandomizationOption);
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
            returnValue[key] = bodyBaseFromResource(
                resource,
                f,
                enableRandomizationOption
            );
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
        return bodyBaseFromResource(
            resource,
            template,
            enableRandomizationOption
        );
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
    caseEntry: Case
) {
    // Step 1, generate URL
    const urlArr = urlTemplate.split("/");
    const url = urlArr
        .map(urlItem =>
            isTemplateString(urlItem)
                ? getValueFromResource(resource, urlItem)
                : urlItem
        )
        .join("/");

    const reqBodyTemplate = caseEntry.request.body;
    const resBodyTemplate = caseEntry.response.body;

    const reqBody = bodyFromResource(resource, reqBodyTemplate, true);
    const resBody = bodyFromResource(resource, resBodyTemplate, false);
    return { url, reqBody, resBody };
}

function extractFromBodyBase(template: BodyBase, data: any) {
    const partialRecord: Record<string, any> = {};
    if (isTemplateString(template)) {
        if (template === "{resource}") return data;
        _.set(
            partialRecord,
            template.slice(1, template.length - 1).replace("resource.", ""),
            data
        );
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
                ...extractFromBodyBase(t, data[key])
            };
        else if (isValidBodyRecursion(t))
            partialRecord = {
                ...partialRecord,
                ...extractFromBodyRecursion(t, data[key])
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
    resBody: Record<string, any>,
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
