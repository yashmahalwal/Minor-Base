export interface SetupConfig<
    T extends Record<string, any> = { [key: string]: any }
> {
    validate: (resource: T) => boolean;
    generate: () => T;
    [key: string]: any;
}

export interface JSONSchema {
    [key: string]: string | JSONSchema;
}
