const express = require("express")
const bcrypt = require("bcrypt")
var cors = require('cors')
const jwt = require("jsonwebtoken")
var low = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
var adapter = new FileSync("./database.json");
var db = low(adapter);

// Initialize Express app
const app = express()

// Define a JWT secret key. This should be isolated by using env variables for security
const jwtSecretKey = "dsfdsfsdfdsvcsvdfgefg"

// Set up CORS and JSON middlewares
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic home route for the API
app.get("/", (_req, res) => {
    res.send("Auth API.\nPlease use POST /auth & POST /verify for authentication")
})

// The auth endpoint that creates a new user record or logs a user based on an existing record
app.post("/auth", (req, res) => {
    
    const { email, password } = req.body;

    console.log("login request for email " + email + " password " + password);
    // Look up the user entry in the database
    const user = db.get("users").value().filter(user => email === user.email)

    // If found, compare the hashed passwords and generate the JWT token for the user
    if (user.length === 1) {
        bcrypt.compare(password, user[0].password, function (_err, result) {
            if (!result) {
                console.log('Invalid password');
                return res.status(401).json({ message: "Invalid password" });
            } else {
                let loginData = {
                    email,
                    signInTime: Date.now(),
                };
                const token = jwt.sign(loginData, jwtSecretKey);
                console.log('Successful login');
                return res.status(200).json({ message: "success", token });
            }
        });
    // If no user is found, hash the given password and create a new entry in the auth db with the email and hashed password
    } else {
        console.log('User not found password');
        return res.status(404).json({message: "User not found"});
    }
})

app.post('/create-account', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const existingUser = db.get("users").value().filter(user => email === user.email);
    if (existingUser.length === 1) {
        console.log('Another user found. Can not create new account');
        return res.status(409).json({message: "Another user with same email already exists!"});
    }

    bcrypt.hash(password, 10, function (_err, hash) {
        console.log({ email, password: hash })
        db.get("users").push({ email, password: hash, firstName: firstName, lastName: lastName }).write()

        let loginData = {
            email,
            signInTime: Date.now(),
        };

        const token = jwt.sign(loginData, jwtSecretKey);
        res.status(200).json({ message: "success", token });
    });

})

// The verify endpoint that checks if a given JWT token is valid
app.post('/verify', (req, res) => {
    const tokenHeaderKey = "jwt-token";
    const authToken = req.headers[tokenHeaderKey];
    try {
      const verified = jwt.verify(authToken, jwtSecretKey);
      if (verified) {
        return res
          .status(200)
          .json({ status: "logged in", message: "success" });
      } else {
        // Access Denied
        return res.status(401).json({ status: "invalid auth", message: "error" });
      }
    } catch (error) {
      // Access Denied
      return res.status(401).json({ status: "invalid auth", message: "error" });
    }

})

// An endpoint to see if there's an existing account for a given email address
app.post('/check-account', (req, res) => {
    const { email } = req.body

    console.log(req.body)

    const user = db.get("users").value().filter(user => email === user.email)

    console.log(user)

    if (user.length === 1) {
        return res.status(200).json({message: "User exists", exists: true});
    }
    return res.status(200).json({message: "User does not exist", exists: false});
})

app.listen(3080)