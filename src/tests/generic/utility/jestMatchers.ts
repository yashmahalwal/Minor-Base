import { compareResponseBodies } from "./endpoints";
import { Body } from "../types";

export const toMatchStatus = (
    recieved: number,
    expected: number | number[]
) => {
    let pass: boolean = false;
    let message: string = "";

    if (Array.isArray(expected)) {
        if (expected.includes(recieved)) {
            pass = true;
            message = "";
        } else {
            pass = false;
            message = `Status mismatch: Expected ${expected.join(
                " "
            )}, recieved ${recieved}`;
        }
    } else {
        if (expected === recieved) {
            pass = true;
            message = "";
        } else {
            pass = false;
            message = `Status mismatch: Expected ${expected}, recieved ${recieved}`;
        }
    }
    return {
        pass,
        message: () => message,
    };
};

export const toMatchBody = (
    resBodyActual: number,
    expected: { resBodyExpected: any; template: Body }
) => {
    let pass: boolean = false;
    let message: string = "";
    if (
        compareResponseBodies(
            resBodyActual,
            expected.resBodyExpected,
            expected.template
        )
    ) {
        pass = true;
    } else {
        pass = false;
        message =
            "Response body from the server did not match the expected response body";
    }

    return {
        pass,
        message: () => message,
    };
};

expect.extend({
    toMatchStatus,
    toMatchBody,
});

export {};
declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchStatus(expected: number | number[]): R;
            toMatchBody(expected: { resBodyExpected: any; template: Body }): R;
        }
    }
}
