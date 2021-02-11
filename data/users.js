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

//Create a new user function
//param bugReport is an object describing the new user you wish to add to the database
const addUser = (user) => {
    const myPromise = new Promise((resolve, reject) => {    //resolve handles the desired data, reject handles when something goes wrong.
        MongoClient.connect(url, settings, function(err, client) {
            if(err) {   //if database connection fails
                reject(err);
            } else {
                console.log("Connected to db for CREATE");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                collection.insertOne(user, (err, result) => {  //Attempt to insert the new user
                    if(err) {   //if insertOne MongoDB function fails, reject the promise with an error message.
                        reject(err);
                    } else {
                        let response = {insertedCount : result.insertedCount}; //Wrap the newly added user in an object with description
                        response.insertedItem = result.ops[0];
                        resolve(response);
                        client.close(); //Make sure to end connection to database since we are done accessing it
                    }
                });
            }
        });
    });
    return myPromise;
}

//Update (replace) a user. If a valid id that doesn't exist already is given, a new user is created instead.
//param id: a 24 character hexidecimal (0-9 and a-f allowed) string that matches the MongoDB _id
//param user: an object describing the updated user, please include all key-value pairs. Please exclude _id from this object
const updateUser = (id, user) => {
    const myPromise = new Promise((resolve, reject) => {
        if(user.hasOwnProperty('_id')) {   //If the user contains the immutable _id, we want to tell the client it was a bad request
            reject({ error: "Request body cannot contain an _id since a MongoDB id is immutable. Please remove _id from request body."});
        }
        MongoClient.connect(url, settings, function(err, client) {  //connect to database
            if(err) {   //If something goes wrong with connecting
                reject(err);    //send connection error
            } else {
                console.log("Connected to db for update (replace)");
                try {   //attempt to update the user
                    const db = client.db(dbName);
                    const collection = db.collection(colName);
                    const userId = { _id: ObjectID(id) };    //If invalid id structure, error will be thrown
                    collection.replaceOne(userId, user, { upsert : true }, (err, result) => {
                        if(err) {   //If replaceOne doesn't work, return an error via promise
                            reject(err);
                        } else {
                            let trimmedResult = {   //restructure response to included the updated count and the object itself
                                modifiedItem : result.ops[0],
                                modifiedCount : result.modifiedCount
                            };
                            trimmedResult.modifiedItem._id = id;    //MongoDB's replaceOne return doesn't include an _id, we add it here
                            resolve(trimmedResult);
                            client.close();
                        }
                    });
            } catch (err) { //if an error is thrown during the try, it should be an invalid id error.
                reject({ error: "Id given doesn't match ObjectID structure. Please use 24 hex character string." })
            }
            }
        })
    });
    return myPromise;
}

module.exports = {
    getUsers,
    getUserByMongoId,
    addUser,
    updateUser
}