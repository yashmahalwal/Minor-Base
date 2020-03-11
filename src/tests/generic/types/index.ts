import faker from "faker";
import _ from "lodash";
/* Interface for a generic JSON */
export type JSONPrimitives = string | boolean | number | null;

export interface JSON {
    [key: string]: JSONPrimitives | JSONPrimitives[] | JSON | JSON[];
}

export type Nullable = { nullable?: boolean };
export type Optional = { optional?: boolean };

export * from "./endpoints";
export * from "./resource";