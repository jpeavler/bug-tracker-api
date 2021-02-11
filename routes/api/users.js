const express = require('express');
const router = express.Router();
const { getUsers, getUserByMongoId, addUser } = require("../../data/users");

//Get Routers
//Get all users
router.get("/", async (req, res) => {   //req allows us to access request information, res allows us to send out a response to the client
    try {
        const users = await getUsers();   //accessing data from database takes time, that is why we use async and await
        res.send(users);    //Once grabbed from database, send array of users to client
    } catch (err) { //Only error will be serverside since no bad request can be made to this route
        console.log(err); //Print out detailed error message
        res.status(500).send("Internal server issue, check logs");  //Send server error code and prompt to check details. Hopefully never seen by end user.
    }
});
//Get a single user with a MongoDB _id
router.get("/:id", async (req, res) => {
    try {
        const user = await getUserByMongoId(req.params.id);    //req.params allows us to pull the id out of the URI
        res.send(user);
    } catch (err) { //Error can be caused by server or by client.
        if(err.error) { //If the dal sent an object with an error message detailing a client's bad request
            res.status(400).send(err);
        } else {    //The error is caused by poorly written code on the server. Hopefully never happens with end user.
            console.log(err);
            res.status(500).send("Internal server issues, check logs");
        }
    }
});
//Post router. Used to add a new user
router.post("/", async (req, res) => {
    try {
        const newUser = await addUser(req.body);
        res.send(newUser);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server issue, check logs");
    }
});

module.exports = router;