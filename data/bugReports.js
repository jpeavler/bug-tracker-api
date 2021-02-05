const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

//Connection url, settings, and database/collection names
const url = process.env.ATLAS_CONNECTION;
const settings = {useUnifiedTopology: true};
const dbName = 'bug_tracker';
const colName = 'bug_reports';

//Get bug reports from database functions
const getBugReports = () => {   //getBugReports returns all active Bug Reports
    const myPromise = new Promise((resolve, reject) => {    //Use a promise since getting data from the database takes time
        MongoClient.connect(url, settings, function(err, client) {  //Connect to the database
            if(err) {
                reject(err);
            } else {
                console.log("Connected to DB for READ all");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                collection.find({}).toArray(function(err, docs) {   //Find all bug reports and return them in an array
                    if(err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log("Found the requested inventory");
                        resolve(docs);  //Resolve the promise with the array of 
                        client.close();
                    }
                });
            }
        });
    });
    return myPromise;
}

const getBugReportById = (id) => {
    const myPromise = new Promise((resolve, reject) => {
        MongoClient.connect(url, settings, async function(err, client) {
            if(err) {
                reject(err);
            } else {
                console.log("Connected to DB for READ one");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                try {
                    const _id = new ObjectID(id);
                    const result = await collection.findOne({_id}); //look for the bug report with the requested Mongo ObjectID
                    if(result) {    //If the idea is found
                        resolve(result);
                    } else {
                        reject({ error: "ID not found in database" });
                    }
                    client.close();
                } catch (err) {
                    reject({ error: "ID must be in ObjectID format" });
                }
            }
        });
    });
    return myPromise;
}

//Create a new bug report function
const addBugReport = (bugReport) => {
    const myPromise = new Promise((resolve, reject) => {
        MongoClient.connect(url, settings, function(err, client) {
            if(err) {
                reject(err);
            } else {
                console.log("Connected to db for CREATE");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                collection.insertOne(bugReport, (err, result) => {
                    if(err) {
                        reject(err);
                    } else {
                        let response = {insertedCount : result.insertedCount};
                        response.insertedItem = result.ops[0];
                        resolve(response);
                        client.close();
                    }
                });
            }
        });
    });
    return myPromise;
}

module.exports = {
    getBugReports,
    getBugReportById,
    addBugReport
}