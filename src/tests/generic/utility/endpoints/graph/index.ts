// @ts-ignore
import Graph from "graph-data-structure";
import _ from "lodash";
import {
    MethodType,
    EndpointJSON,
    URLJSON,
    Method,
    Case,
} from "../../../types";

export interface NodeName {
    method: MethodType;
    key: Case["key"];
    index: number;
}

export interface CaseInfo {
    endpoint: EndpointJSON;
    url: URLJSON;
    method: Method;
    name: NodeName;
    case: Case;
}

export function parseNodeName(nodeName: string): NodeName | null {
    const o = JSON.parse(nodeName);
    if (
        "index" in o &&
        typeof o.index === "number" &&
        ["GET", "PUT", "PATCH", "POST", "DELETE"].includes(o.method) &&
        "key" in o &&
        ["POSITIVE", "NEGATIVE", "DESTRUCTIVE"].includes(o.key)
    ) {
        return o as NodeName;
    }
    throw new Error("Invalid object after parsing the node name");
}

export function serializeNodeName(n: NodeName): string {
    return JSON.stringify(n);
}

function visitAdjacentNodes(
    graph: ReturnType<typeof Graph>,
    node: string,
    stepNumber: number = 0
): string[][] {
    if (stepNumber === 1) {
        // Process has ended, return control.
        return [[node]];
    }

    const adjacentNodes = graph.adjacent(node);
    const pathMatrix: any = [];
    for (const adjacentNode of adjacentNodes) {
        const m = visitAdjacentNodes(graph, adjacentNode, stepNumber - 1);
        for (const path of m) {
            pathMatrix.push([node, ...path]);
        }
    }

    if (!pathMatrix.length) return [[node]];

    return pathMatrix;
}

export function traverseGraph(
    graph: ReturnType<typeof Graph>,
    steps: number = 1
) {
    const nodes = graph.nodes();
    const paths: string[][] = [];
    for (const node of nodes) {
        paths.push(...visitAdjacentNodes(graph, node, steps));
    }
    return paths;
}

export * from "./makeGraph";
