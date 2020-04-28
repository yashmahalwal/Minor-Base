import faker from "faker";
import { studentMap } from "./collection";

export interface Student {
    id: string;
    name?: string;
    age: number;
    addresses: [number | null];
    branch: { title: string };
    classes: {
        nameNumber: number | string;
        sampleField?: { sampleNested: number } | null;
    };
}

export const validations = {
    isValidId: (id: any) => {
        return typeof id === typeof faker.random.uuid();
    },
    isValidName: (name: any) =>
        name ? typeof name === typeof faker.name.firstName() : true,
    isValidAge: (age: any) =>
        typeof age === typeof faker.random.number()
            ? age >= 0 && age <= 100
            : false,
    isValidAddresses: (addresses: any) => {
        if (Array.isArray(addresses)) {
            for (const add of addresses)
                if (add !== null && typeof add !== "string") return false;
            return true;
        }
        return false;
    },
    isValidBranch: (branch: any) =>
        branch && branch.title ? typeof branch.title === "string" : false,
    isValidClasses: (classes: any) => {
        if (!classes || typeof classes !== "object") {
            return false;
        }

        if (
            typeof classes.nameNumber !== typeof faker.random.number() &&
            typeof classes.nameNumber !== typeof faker.lorem.lines(1)
        )
            return false;

        if (classes.sampleField) {
            if (
                typeof classes.sampleField.sampleNested !==
                typeof faker.random.number()
            )
                return false;
        }
        return true;
    }
};

export function isStudent(o: any): o is Student {
    if (!o || typeof o !== "object") return false;

    if (!validations.isValidId(o.id)) return false;
    if (!validations.isValidName(o.name)) return false;
    if (!validations.isValidAddresses(o.addresses)) return false;
    if (!validations.isValidAge(o.age)) return false;
    if (!validations.isValidBranch(o.branch)) return false;
    if (!validations.isValidClasses(o.classes)) return false;
    return true;
}
