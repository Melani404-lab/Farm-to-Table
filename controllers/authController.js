const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", ({ body }, res) => {
  // hash password
  bcrypt.hash(body.password, 10).then((hashPassword) => {
    // create database user object
    const newUser = {
      email: body.email.toLowerCase(), // Store emails in lowercase
      name: body.name,
      address: body.address,
      password: hashPassword,
    };

    // create user in database
    User.create(newUser)
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  });
});

router.post("/login", (req, res) => {
  // Convert email to lowercase for consistent comparison
  const email = req.body.email.toLowerCase();
  
  User.findOne({ email: email })
    .then((user) => {
      // Check if user exists
      if (!user) {
        console.log(`No user found with email: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Now we know user exists, compare passwords
      bcrypt
        .compare(req.body.password, user.password)
        .then((result) => {
          if (result) {
            // Password matches, create token
            const token = jwt.sign(
              { _id: user._id },  // Fixed: using user._id instead of result._id
              process.env.JWT_SIGNATURE
            );

            res.json({
              token: token,
              _id: user._id,
              role: user.role,
            });
          } else {
            // Password doesn't match
            res.status(401).json({ message: "Invalid email or password" });
          }
        })
        .catch((err) => {
          console.log("Password comparison error:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.log("User lookup error:", err);
      res.status(500).json({ message: "Server error" });
    });
});

router.get("/email", (req, res) => {
  User.findById(req.query.id, "email name")
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      //console.log(err);
      res.status(500).end();
    });
});

module.exports = router;