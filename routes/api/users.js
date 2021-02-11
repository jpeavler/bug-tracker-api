const express = require('express');
const router = express.Router();
const { getUsers } = require("../../data/users");

//Get Routers
//Get all users
router.get("/", async (req, res) => {   
    try {
        const users = await getUsers();   //accessing data from database takes time
        res.send(users);    //Once grabbed from database, send array of users to client
    } catch (err) { //Only error will be serverside since no bad request can be made to this route
        console.log(err); //Print out detailed error message
        res.status(500).send("Internal server issue, check logs");  //Send server error code and prompt to check details. Hopefully never seen by end user.
    }
});
//

module.exports = router;