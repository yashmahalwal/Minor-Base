import { Optional } from ".";
import { FieldBase, isValidFieldBase } from "./resource";
/* Endpoints */

// String for templating resource and fields
export type ResourceTemplateString = string;
export function isTemplateString(s: any): s is ResourceTemplateString {
    if (typeof s !== "string") return false;
    if (s.startsWith("{") && s.endsWith("}")) {
        const s1 = s.slice(1, s.length - 1);
        const components = s1.split(".");
        if (components[0] !== "resource") return false;
        return components.reduce(
            (prevValue, curr) => prevValue && curr.search(/\s/) === -1,
            true
        );
    }

    return false;
}

export type BodyBase = null | ResourceTemplateString | FieldBase;
export function isValidBodyBase(b: any): b is BodyBase {
    return b === null || isTemplateString(b) || isValidFieldBase(b);
}

export interface BodyRecursion {
    [key: string]:
        | BodyBase
        | BodyRecursion
        | ({ field: BodyBase | BodyRecursion } & Optional);
}
export function isValidBodyRecursion(b: any): b is BodyRecursion {
    if (!b || typeof b !== "object") return false;
    for (const key in b) {
        let f: BodyBase | BodyRecursion;
        if (b[key] && typeof b[key] === "object" && "field" in b[key])
            f = b[key]["field"];
        else f = b[key];
        if (!isValidBodyBase(f) && !isValidBodyRecursion(f)) return false;
    }
    return true;
}

export type Body = BodyRecursion | Exclude<BodyBase, FieldBase>;

export function isValidBody(b: any): b is Body {
    if (isValidBodyBase(b) && !isValidFieldBase(b)) return true;
    if (isValidBodyRecursion(b)) return true;
}

export interface Case {
    key: "POSITIVE" | "NEGATIVE" | "DESTRUCTIVE";
    request: { body: Body };
    response: { status: number | number[]; body: Body };
}

export function isValidCase(o: any): o is Case {
    if (typeof o !== "object" || o === null) return false;
    if (!["POSITIVE", "NEGATIVE", "DESTRUCTIVE"].includes(o.key)) return false;
    if (!isValidBody(o.request?.body)) return false;
    if (Array.isArray(o.response?.status))
        for (const stat of o.response.status) {
            if (typeof stat !== "number") return false;
        }
    else if (typeof o.response?.status !== "number") return false;

    if (!isValidBody(o.response?.body)) return false;

    return true;
}

export type MethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Method {
    method: MethodType;
    cases: Case[];
}
export function isValidMethod(m: any): m is Method {
    if (!m || typeof m !== "object") return false;
    if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(m.method))
        return false;
    if (Array.isArray(m.cases)) {
        for (const c of m.cases) if (!isValidCase(c)) return false;
        return true;
    }
    return false;
}

export interface URLJSON {
    url: string;
    methods: Method[];
}
export function isValidURLJSON(u: any): u is URLJSON {
    if (!u || typeof u !== "object") return false;
    if (typeof u.url !== "string") return false;
    if (Array.isArray(u.methods)) {
        for (const method of u.methods) {
            if (!isValidMethod(method)) return false;
        }
        return true;
    }
    return false;
}
export interface EndpointJSON {
    endpoint: string;
    urls: URLJSON[];
}

export function isValidEndpointJSON(u: any): u is EndpointJSON {
    if (!u || typeof u !== "object") return false;
    if (typeof u.endpoint !== "string") return false;
    if (Array.isArray(u.urls)) {
        for (const url of u.urls) {
            if (!isValidURLJSON(url)) return false;
        }
        return true;
    }
    return false;
}

// Interface for schema.endpoints
export interface EndpointsJSON {
    endpoints: EndpointJSON[];
}
export function isValidEndpointsJSON(e: any): e is EndpointJSON {
    if (!e || typeof e !== "object") return false;
    if (Array.isArray(e.endpoints)) {
        for (const endpoint of e.endpoints) {
            if (!isValidEndpointJSON(endpoint)) return false;
        }
        return true;
    }
    return false;
}
