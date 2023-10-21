import express from 'express';
import bcrypt from "bcrypt";
import { deleteString, findId, findUser, generateToken, getUsers, insertRandomString, insetData } from "../Controllers/user.js";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
    }
})

const router = express.Router();

const URL = 'https://password-resetapp.netlify.app'


// signup page
router.post("/signup", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        //  console.log(salt);
        const signUpData = req.body;
        console.log(signUpData);
        if (!signUpData.email || !signUpData.password) {
            return res.status(404).json({ message: "error found in getting input" })
        }
        //  console.log(signUpData.email);
        const checkUser = await findUser(signUpData.email);
        // console.log('check', checkUser);
        if (!checkUser) {

            const hashedPassword = await bcrypt.hash(signUpData.password, salt)
            const hashedUser = await { ...signUpData, password: hashedPassword }
            const insertedData = await insetData(hashedUser);

            //  console.log(insertedData);
            if (!insertedData) {
                return res.status(404).json({ message: "error found in posting input" })
            }
            return res.status(200).json({ "Sign Up done successfully": hashedUser })
        }
        res.status(400).json({ message: "User alreay exist" })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" })
    }
})

// login page
router.post("/login", async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(404).json({ message: "error found in getting input" })
        }
        const user = await findUser(req.body.email);
        console.log('check', user);
        if (!user) {
            return res.status(400).json({ message: "Invalid Email" })
        }
        // valid password check
        const passwordCheck = await bcrypt.compare(req.body.password, user.password)
        console.log("passwordCheck", passwordCheck)
        if (!passwordCheck) {
            return res.status(400).json({ message: "Invalid Password" })
        }
        const token = await generateToken(user._id)
        if (!token) {
            return res.status(404).json({ message: "error found in generate token" })
        }
        return res.status(200).json({ data: user, token: token })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" })
    }
})

// forget password
router.post("/forgotpassword", async (req, res) => {
    try {
        const user = await findUser(req.body.email)
         console.log('userfind', user);
        if (!user) {
            return res.status(400).json({ message: false, error: "emailid not received" })
        }
        const randomSting = process.env.RANDOM_STRING + user._id;
        const link = `${URL}/password-reset?id=${user._id}&randomstring=${randomSting}`
        console.log(link)

        const mailOptions = {
            from: process.env.MAIL,
            to: user.email,
            subject: 'password reset alert',
            text: `click below link to reset your password. ${link}`
        }

        const RandomString = await insertRandomString(user._id, { randomstring: randomSting })
        console.log(RandomString);

        if (!RandomString.lastErrorObject.updatedExisting) {
            return res.status(400).json({ message: false, error: "Error found in update random sting" })
        }

        transport.sendMail(mailOptions, (err, info) => {
            console.log(mailOptions);
            if (err) {
                console.log(err);
                return res.status(400).json({ message: false, error: "Error found send mail for resetpassword" })
            } else {
                console.log('Email sent', + info)
                return res.status(200).json({ message: "link send successfully" })
            }
        })

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err })
    }
})

// password reset
router.post("/password-reset", async (req, res) => {
    try {
        const { id, randomstring } = req.query;
        if (!id || !randomstring) {
            return res.status(400).json({ message: false, error: "Invalid id and string" })
        }
        // console.log('it is working');
        const user = await findId(id)
        if (!user) {
            return res.status(400).json({ message: false, error: "user not available" })
        }
        if (user.randomstring === randomstring) {
            return res.status(200).json({ message: "Authorization successfully done" })
        } else {
            return res.status(400).json({ message: false, error: "error in Authorize the link" })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
})

// password-reset and update logice
router.post("/password-reset/update", async (req, res) => {
    try {
        const { id, newpassword } = req.query;
        console.log("id", id);
        console.log('newpassword', newpassword);
        if (!id || !newpassword) {
            return res.status(400).json({ message: false, error: "Error found in get id or password" })
        }
        //  console.log('it is working');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpassword, salt);
        console.log('id', id, 'hashedpassword', hashedPassword);
        const user = await insertRandomString(id, { password: hashedPassword })
        console.log("user-R", user)
        const deleteRamdomString = await deleteString(id, { randomstring: 1 })
        console.log("delete-R", deleteRamdomString)
        if (!user) {
            return res.status(400).json({ message: false, error: "user not found in updating new password" })
        }

        return res.status(200).json({ message: "New password updated successfully" })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
})

// test
export const authorizeLogin = router.post("/", (req, res) => {
    try {
        return res.status(200).json({ message: "ok" })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }

})

export const userRouter = router;

//test
export const getAllUser = router.get("/", async (req, res) => {
    try {
        const users = await getUsers();
        // console.log(users);
        if (!users) {
            return res.status(404).json({ message: "error found in getting users" })
        }
        res.status(200).json({ data: users })
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err })
    }
})





