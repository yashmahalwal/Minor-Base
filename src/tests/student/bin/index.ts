import "./validation";
import { endpoints } from "../schema.json";
import { EndpointsJSON } from "../../generic/types";
import { makeGraph, traverseGraph } from "../../generic/utility/endpoints";

const [graph, graphMap] = makeGraph(endpoints as EndpointsJSON["endpoints"]);
console.log(traverseGraph(graph, 3).filter((item) => item.length < 3));
