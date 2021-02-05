const express = require('express');
const router = express.Router();
const {getBugReports} = require('../../data/bugReports');

//Get Routers
    router.get("/", async (req, res) => {   //Get all active bug reports
        try {
            const bugReports = await getBugReports();   //accessing data from database takes time
            res.send(bugReports);
        } catch (err) { //Only error will be serverside since no bad request can be made to this route
            console.log(err); //Print out detailed error message
            res.status(500).send("Internal server issue, check logs");  //Send server error code and prompt to check details. Hopefully never seen by end user.
        }
    });
//

module.exports = router;