const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

//Connection url, settings, and database/collection names. Used to connect to right database
const url = process.env.ATLAS_CONNECTION;
const settings = {useUnifiedTopology: true};
const dbName = 'bug_tracker';
const colName = 'users';

/***************************************************************************|
|  Note: The MongoDB collection users doesn't handle any authentication,    |
|  that is handled by Firebase. A user will have a uid, which will connect  |
|  that user to their account on Firebase. Instead, MongoDB will store all  |
|  functional information tied to a user like their history and whether they|
|  have admin priviliges.                                                   |
****************************************************************************/

//Get user data from database functions
const getUsers = () => {   //getUsers returns all users
    const myPromise = new Promise((resolve, reject) => {    //Use a promise since getting data from the database takes time
        MongoClient.connect(url, settings, function(err, client) {  //Connect to the database
            if(err) {
                reject(err);
            } else {
                console.log("Connected to DB for READ all");
                const db = client.db(dbName);   //This and next line ensure we are accessing data at the right spot
                const collection = db.collection(colName);
                collection.find({}).toArray(function(err, docs) {   //Find all users and return them in an array
                    if(err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log("Found the requested users");
                        resolve(docs);  //Resolve the promise with the array of users
                        client.close();
                    }
                });
            }
        });
    });
    return myPromise;
}
//Get a single user's data by MongoDB _id which is a 24 hex character string.
const getUserByMongoId = (id) => {
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
                    const result = await collection.findOne({_id}); //look for the user with the requested Mongo ObjectID
                    if(result) {    //If the user with the requested id is found
                        resolve(result);    //Resolve the promise with the user with the given id
                    } else {    //If no user is found by findOne
                        reject({ error: "ID not found in database" }); //Notify the API with an error message
                    }
                    client.close();
                } catch (err) { //If trying to create a new ObjectID object throws an error, tell the client to send the right id structure
                    reject({ error: "Id given doesn't match ObjectID structure. Please give 24 hex character string." });
                }
            }
        });
    });
    return myPromise;
}

module.exports = {
    getUsers,
    getUserByMongoId
}