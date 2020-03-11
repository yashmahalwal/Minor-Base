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
import { generateFieldBaseData } from "../resource";

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
