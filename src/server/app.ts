import { studentMap } from "./student/collection";
import express from "express";
import { isStudent, validations } from "./student/types";

const app = express();

app.get("/Student/:id", (req, res) => {
    // Parse the request
    const {
        params: { id },
    } = req;

    const student = studentMap.get(id);
    if (student) {
        // {student: student}
        res.status(200).send({ student });
        return;
    } else {
        res.sendStatus(404);
        return;
    }
});

app.delete("/Student/:id", (req, res) => {
    // Parse the request
    const {
        params: { id },
    } = req;

    if (!id) {
        res.sendStatus(400);
        return;
    }

    const student = studentMap.get(id);
    if (student) {
        studentMap.delete(id);
        res.status(200).send({ student });
        return;
    } else {
        res.sendStatus(404);
        return;
    }
});

app.post("/Student/:id", express.json(), (req, res) => {
    const {
        body: { student },
    } = req;

    if (!isStudent(student)) {
        res.sendStatus(400);
        return;
    }

    if (studentMap.has(student.id)) {
        res.sendStatus(409);
    }
    studentMap.set(student.id, student);
    res.status(201).send({ student });
});

app.put("/Student/:id", express.json(), (req, res) => {
    const {
        body: { student },
    } = req;

    if (!isStudent(student)) {
        res.sendStatus(400);
        return;
    }

    studentMap.set(student.id, student);
    if (studentMap.has(student.id)) {
        res.status(200).send({ resource: student });
    }
    res.status(201).send({ resource: student, created: true });
});

function validateField(field: any, validationFunction: (f: any) => boolean) {
    return validationFunction(field);
}

app.patch("/Student/:id", express.json(), (req, res) => {
    const {
        body: { student },
        params: { id },
    } = req;

    if (!id || !studentMap.has(id)) {
        res.sendStatus(404);
        return;
    }
    const s = studentMap.get(id);
    const fields = ["id", "age", "name", "addresses", "branch", "classes"];
    for (const fieldName of fields) {
        if (fieldName in student) {
            if (
                validateField(
                    student[fieldName],
                    validations[
                        `isValid${fieldName
                            .charAt(0)
                            .toLocaleUpperCase()}${fieldName.slice(1)}`
                    ]
                )
            ) {
                s[fieldName] = student[fieldName];
            } else {
                res.sendStatus(400);
                return;
            }
        }
    }

    res.status(200).send({ student: s });
});

export default app;
