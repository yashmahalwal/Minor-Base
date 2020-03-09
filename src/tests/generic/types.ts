export type BasicFieldType = string | { field: string; args?: any[] };

export type FieldBase = {
    type: BasicFieldType | BasicFieldType[];
    plural?: boolean; // Default - false
    nullable?: boolean; // Default - false
};

export type JSONPrimitives = string | boolean | number | null;

export interface JSON {
    [key: string]: JSONPrimitives | JSONPrimitives[] | JSON | JSON[];
}

export interface ResourceJSON {
    id: FieldBase;
    [key: string]: FieldBase | Omit<ResourceJSON, "id">;
}
