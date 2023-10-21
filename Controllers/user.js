import { ObjectId } from "mongodb";
import { client } from "../db.js";
import jwt from "jsonwebtoken";

export function insetData(singUpData) {
    return client
        .db("demo")
        .collection("users")
        .insertOne(singUpData)
}

export function getUsers() {
    return client
        .db("demo")
        .collection("users")
        .find()
        .toArray()
}

export function findUser(email) {
    return client
        .db("demo")
        .collection("users")
        .findOne({ email: email })
}

export function generateToken(id) {
    return jwt.sign(
        { id },
        process.env.SECURE_KEY,
        { expiresIn: "30d" }

    )
}

export function insertRandomString(id, data) {
    return client
        .db("demo")
        .collection("users")
        .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data })
}

export function findId(id) {
    return client
        .db("demo")
        .collection("users")
        .findOne({ _id: new ObjectId(id) })
}

export function deleteString(id, data) {
    console.log(data);
    return client
        .db("demo")
        .collection("users")
        .updateOne({ _id: new ObjectId(id) }, { $unset: data })
}