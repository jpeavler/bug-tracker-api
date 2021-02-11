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

module.exports = {
    getUsers
}