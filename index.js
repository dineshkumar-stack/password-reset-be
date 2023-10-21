import express from "express";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import { authorizeLogin, getAllUser, userRouter } from "./Routes/user.js";
import { isAuthenticated } from "./Authentication/userAuth.js";


//port
const port = process.env.PORT || 3000;


// initiating server
const app = express();

// middle ware
app.use(express.json());
app.use(cors());

// application middleware
app.use("/user", userRouter);
app.use("/userall", getAllUser);
app.use("/home", isAuthenticated, authorizeLogin);


// intial landing page
app.get("/", (req, res) => {
    res.send("Password - Reset");
})

// listen and start http server in localhost
app.listen(port, () => {
    console.log(`Server running on ${port} Status : Active`);
})