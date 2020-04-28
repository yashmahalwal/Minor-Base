import * as Postive from "./positive";
import * as Negative from "./negative";
import * as Destructive from "./destructive";
import supertest from "supertest";
import { CaseInfo } from "..";
import { ResourceJSON } from "../../../types";

export interface RequestReturnValue {
    resBodyExpected: any;
    resBodyActual: any;
    status: number;
    returnedInstance: Record<string, any>;
}

export async function makeRequest(
    server: supertest.SuperTest<supertest.Test>,
    collection: Map<string, Record<string, any>>,
    caseInfo: CaseInfo,
    resourceJSON: ResourceJSON,
    instance: Record<string, any>
) {
    if (caseInfo.case.key === "POSITIVE")
        return Postive.makePositiveRequest(
            server,
            collection,
            caseInfo,
            resourceJSON,
            instance
        );
    else if (caseInfo.case.key === "NEGATIVE")
        return Negative.makeNegativeRequest(
            server,
            collection,
            caseInfo,
            resourceJSON,
            instance
        );
    else if (caseInfo.case.key === "DESTRUCTIVE") {
        return Destructive.makeDestructiveRequest(
            server,
            caseInfo,
            resourceJSON,
            instance
        );
    }
}
