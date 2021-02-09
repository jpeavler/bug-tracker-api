const express = require('express');
const router = express.Router();
const {getBugReports, getBugReportById, addBugReport, updateBugReport, deleteBugReport} = require('../../data/bugReports');

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
//Post router
router.post("/", async (req, res) => {
    try {
        const newReport = await addBugReport(req.body);
        res.send(newReport);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server issue, check logs");
    }
});

//Put router (replaces current bugReport with new one)
router.put("/:id", async (req, res) => {
    try {
        const updatedReport = await updateBugReport(req.params.id, req.body);
        res.send(updatedReport);
    } catch (err) {
        if(err.error) {
            res.status(400).send(err.error);
        } else {
            console.log(err);
            res.status(500).send("Internal server issue, check logs");
        }
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const removedReport = await deleteBugReport(req.params.id);
        res.send(removedReport);
    } catch (err) {
        if(err.error) {
            res.status(400).send(err);
        } else {
            console.log(err);
            res.status(500).send("Internal server issue, check logs");
        }
    }
});

module.exports = router;