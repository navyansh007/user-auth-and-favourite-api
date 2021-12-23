// See the lines starting from app.get(<some end point>) to see the functionality of the end point

const express = require("express");
const Cryptr = require('cryptr');
const bp = require('body-parser')


const app = express();
const cryptr = new Cryptr('secret-key');


const PORT = process.env.PORT || 3000;
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))


app.get('/users', (req, res) => {
    res.header({"Access-Control-Allow-Origin": "*"})
    var MongoClient = require('mongodb').MongoClient
    var url = "mongodb+srv://admin:admin@userauth-and-favourites.1y2bz.mongodb.net/UserAuthDB?retryWrites=true&w=majority"
    const databasename = "UserAuthDB"
    MongoClient.connect(url).then((client) => {
        const connect = client.db(databasename)
        const collection = connect.collection("users")
        collection.find({}).toArray().then((results) => {
            res.send(results)
        })
        .catch((err) => {
            res.json({"status": "error"})
        })
    })
})

app.post('/register', (req, res) => {
    var MongoClient = require('mongodb').MongoClient
    var url = "mongodb+srv://admin:admin@userauth-and-favourites.1y2bz.mongodb.net/UserAuthDB?retryWrites=true&w=majority"
    const databasename = "UserAuthDB"
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(databasename);
        var username = req.body.username
        var password = String(cryptr.encrypt(req.body.password))
        var user_data = {"username": username, "password": password}

        var moviedata = {"username": username, favourites: []}

        dbo.collection("users").find({username: username}).toArray().then((results) => {
            if (results.length === 0){
                
                dbo.collection("users").insertOne(user_data, function(err) {
                    if (err){ 
                        res.json({"status": "error creating user"})
                    }
                    else {
                        res.json({"status": "success"})
                    }
                })
                dbo.collection("user-favourites").insertOne(moviedata, function(err) {
                    if (err){ 
                        res.json({"status": "error making moviedata"})
                    }
                })

            }
            else {
                res.json({"status": "record exists"})
            }
        })

    })
})

app.post('/login', (req, res) => {
    res.header({"Access-Control-Allow-Origin": "*"})
    var MongoClient = require('mongodb').MongoClient
    var url = "mongodb+srv://admin:admin@userauth-and-favourites.1y2bz.mongodb.net/UserAuthDB?retryWrites=true&w=majority"
    const databasename = "UserAuthDB"
    var username = req.body.username
    var password = req.body.password
    MongoClient.connect(url).then((client) => {
        const connect = client.db(databasename)
        const collection = connect.collection("users")
        collection.find({username: username}).toArray().then((results) => {
            var hashedPassword = results[0].password
            var decryptedString = cryptr.decrypt(hashedPassword);
            if (decryptedString === password){
                res.json({"status": "Login Success", "username": username})
            }
            else {
                res.json({"status": "Login Failed"})
            }
        })
        .catch((err) => {
            res.json({"status": "error"})
        })
    })
})

// Favourite Management
app.get('/favourite', (req, res) => {
    res.header({"Access-Control-Allow-Origin": "*"})
    var MongoClient = require('mongodb').MongoClient
    var url = "mongodb+srv://admin:admin@userauth-and-favourites.1y2bz.mongodb.net/UserAuthDB?retryWrites=true&w=majority"
    const databasename = "UserAuthDB"
    var username = req.query.username
    var movie = req.query.movie

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(databasename);
        dbo.collection("user-favourites").find({username: username}).toArray().then((results) => {
            if (results.length !== 0){
                dbo.collection("user-favourites").updateOne({username: username}, {$push : {favourites : movie}}, function(err) {
                    if (err){ 
                        res.json({"status": "error"})
                    }
                    else {
                        res.json({"status": "success", "username": username, "movies": results[0].favourites})
                    }
                    db.close();
                })
            }
        })
    })
})

app.get('/unfavourite', (req, res) => {
    res.header({"Access-Control-Allow-Origin": "*"})
    var MongoClient = require('mongodb').MongoClient
    var url = "mongodb+srv://admin:admin@userauth-and-favourites.1y2bz.mongodb.net/UserAuthDB?retryWrites=true&w=majority"
    const databasename = "UserAuthDB"
    var username = req.query.username
    var movie = req.query.movie

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(databasename);
        dbo.collection("user-favourites").find({username: username}).toArray().then((results) => {
            if (results.length !== 0){
                dbo.collection("user-favourites").updateOne({username: username}, {$pull : {favourites : movie}}, function(err) {
                    if (err){ 
                        res.json({"status": "error"})
                    }
                    else {
                        res.json({"status": "success", "username": username, "movies": results[0].favourites})
                    }
                    db.close();
                })
            }
        })
    })
})

app.get('/favourites-list', (req, res) => {
    res.header({"Access-Control-Allow-Origin": "*"})
    var MongoClient = require('mongodb').MongoClient
    var url = "mongodb+srv://admin:admin@userauth-and-favourites.1y2bz.mongodb.net/UserAuthDB?retryWrites=true&w=majority"
    const databasename = "UserAuthDB"

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(databasename);
        dbo.collection("user-favourites").find({}).toArray().then((results) => {
            res.json(results)
        })
    })
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });