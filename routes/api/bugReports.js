const express = require('express');
const router = express.Router();
const {getBugReports, getBugReportById} = require('../../data/bugReports');

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

    router.get("/:id", async (req, res) => {
        try {
            const bugReport = await getBugReportById(req.params.id);
            res.send(bugReport);
        } catch (err) { //Error can be caused by server or by client.
            if(err.error) { //If the dal sent an object with an error message detailing a client's bad request
                res.status(400).send(err);
            } else {    //The error is caused by poorly written code on the server. Hopefully never happens with end user.
                console.log(err);
                res.status(500).send("Internal server issues, check logs");
            }
        }
    });
//

module.exports = router;