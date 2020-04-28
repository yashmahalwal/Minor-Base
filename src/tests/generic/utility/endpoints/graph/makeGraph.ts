import { CaseInfo, serializeNodeName, parseNodeName } from "./index";
import {
    EndpointsJSON,
    MethodType,
    Case,
    Method,
} from "../../../types/endpoints";
import Graph from "graph-data-structure";

export type MethodMapKey = { method: MethodType; key: Case["key"] };
export type MethodMapKeySerialized = string;

function serializeMapKey(method: MethodType, key: Case["key"]) {
    return `${method}-${key}`;
}

function deserializeMapKey(_key: string): MethodMapKey {
    const [method, key] = _key.split("-");
    return { method, key } as MethodMapKey;
}

function makeEdges(
    node: MethodMapKeySerialized,
    map: Map<MethodMapKeySerialized, CaseInfo[]>
): MethodMapKeySerialized[] {
    const { method, key } = deserializeMapKey(node);
    const arr: MethodMapKeySerialized[] = [];
    switch (method) {
        case "GET":
            switch (key) {
                case "POSITIVE":
                    [
                        { method: "GET", key: "POSITIVE" },
                        { method: "DELETE", key: "POSITIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "NEGATIVE" },
                        { method: "PATCH", key: "POSITIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "POST", key: "DESTRUCTIVE" },
                        { method: "PATCH", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                case "NEGATIVE":
                    [
                        { method: "GET", key: "NEGATIVE" },
                        { method: "DELETE", key: "NEGATIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "POSITIVE" },
                        { method: "PATCH", key: "NEGATIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "POST", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                default:
                    return arr;
            }
        case "DELETE":
            switch (key) {
                case "POSITIVE":
                    [
                        { method: "GET", key: "NEGATIVE" },
                        { method: "DELETE", key: "NEGATIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "POSITIVE" },
                        { method: "PATCH", key: "NEGATIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "POST", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                case "NEGATIVE":
                    [
                        { method: "GET", key: "NEGATIVE" },
                        { method: "DELETE", key: "NEGATIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "POSITIVE" },
                        { method: "PATCH", key: "NEGATIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "POST", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                default:
                    return arr;
            }
        case "PUT":
            switch (key) {
                case "POSITIVE":
                    [
                        { method: "GET", key: "POSITIVE" },
                        { method: "DELETE", key: "POSITIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "NEGATIVE" },
                        { method: "PATCH", key: "POSITIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "PATCH", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                default:
                    return arr;
            }
        case "POST":
            switch (key) {
                case "POSITIVE":
                    [
                        { method: "GET", key: "POSITIVE" },
                        { method: "DELETE", key: "POSITIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "NEGATIVE" },
                        { method: "PATCH", key: "POSITIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "PATCH", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                case "NEGATIVE":
                    [
                        { method: "GET", key: " POSITIVE" },
                        { method: "DELETE", key: " POSITIVE" },
                        { method: "PUT", key: " POSITIVE" },
                        { method: "POST", key: " NEGATIVE" },
                        { method: "PATCH", key: " POSITIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "PATCH", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                default:
                    return arr;
            }
        case "PATCH":
            switch (key) {
                case "POSITIVE":
                    [
                        { method: "GET", key: "POSITIVE" },
                        { method: "DELETE", key: "POSITIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "NEGATIVE" },
                        { method: "PATCH", key: "POSITIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "PATCH", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                case "NEGATIVE":
                    [
                        { method: "GET", key: "NEGATIVE" },
                        { method: "DELETE", key: "NEGATIVE" },
                        { method: "PUT", key: "POSITIVE" },
                        { method: "POST", key: "POSITIVE" },
                        { method: "PATCH", key: "NEGATIVE" },
                        { method: "PUT", key: "DESTRUCTIVE" },
                        { method: "POST", key: "DESTRUCTIVE" },
                    ].forEach((item) => {
                        const k = serializeMapKey(
                            item.method as MethodType,
                            item.key as Case["key"]
                        );
                        if (map.has(k)) {
                            arr.push(k);
                        }
                    });
                    return arr;
                default:
                    return arr;
            }
        default:
            return arr;
    }
}

export function getFromMap(
    nodeName: string,
    map: Map<MethodMapKeySerialized, CaseInfo[]>
): CaseInfo | undefined {
    const n = parseNodeName(nodeName);
    return map.get(serializeMapKey(n.method, n.key))[n.index];
}

export function makeGraph(
    endpoints: EndpointsJSON["endpoints"]
): [ReturnType<typeof Graph>, Map<MethodMapKeySerialized, CaseInfo[]>] {
    const graphMap: Map<MethodMapKeySerialized, CaseInfo[]> = new Map();

    // A map containing all the ways to call a given method on a resource
    endpoints.forEach(({ urls }, endpointIndex) => {
        urls.forEach(({ methods }, urlIndex) => {
            methods.forEach(({ method, cases }, methodIndex) => {
                cases.forEach((c) => {
                    const o = {
                        endpoint: endpoints[endpointIndex],
                        url: urls[urlIndex],
                        method: methods[methodIndex],
                        case: c,
                    };
                    const mapKey = serializeMapKey(method, c.key);

                    if (!graphMap.has(mapKey)) {
                        graphMap.set(mapKey, [
                            {
                                ...o,
                                name: { method, index: 0, key: c.key },
                            },
                        ]);
                    } else {
                        const arr = graphMap.get(mapKey);
                        arr.push({
                            ...o,
                            name: {
                                method,
                                index: arr.length,
                                key: c.key,
                            },
                        });
                    }
                });
            });
        });
    });

    const graph = Graph();
    for (const [key, value] of graphMap.entries()) {
        const adjacent = makeEdges(key, graphMap);
        value.forEach((sourceNode, sourceIndex) =>
            adjacent.forEach((destinationType) => {
                graphMap
                    .get(destinationType)
                    .forEach((destinationNode, destinationIndex) => {
                        graph.addEdge(
                            serializeNodeName({
                                method: sourceNode.method.method,
                                index: sourceIndex,
                                key: sourceNode.case.key,
                            }),
                            serializeNodeName({
                                method: destinationNode.method.method,
                                index: destinationIndex,
                                key: destinationNode.case.key,
                            }),
                            1
                        );
                    });
            })
        );
    }
    return [graph, graphMap];
}
