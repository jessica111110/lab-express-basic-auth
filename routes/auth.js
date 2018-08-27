const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require("../models/User");

// SINGUP ROUTE
router.get('/signup', (req, res) => {
  res.render('signup');
})


router.post('/signup', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
  if (username === "" || password === "") {
    res.render('signup', {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }
  const rounds = 10;
  const salt = bcrypt.genSaltSync(rounds);
  const hashedPass = bcrypt.hashSync(password, salt);

  User.create({
    username: username,
    password: hashedPass
  })
    .then(newUser => {
      console.log("new user created", newUser)
      res.redirect('/')
    })


});

//LOGIN ROUTE

router.get('/login', (req, res) => {
  res.render('login');
})

router.post("/login", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ "username": username })
    .then(user => {
      if (!user) {
        res.render("login", {
          errorMessage: "The username doesn't exist"
        });
        return;
      }
      if (bcrypt.compareSync(password, user.password)) {
        // Save the login in the session!
        req.session.currentUser = user;
        res.redirect("/secret");
      } else {
        res.render("login", {
          errorMessage: "Incorrect password"
        });
      }
    })
    .catch(error => {
      next(error)
    })
});

router.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.render("login", {
      errorMessage: "Login before goign to secret"
    });
  }
})

router.get('/secret', (req, res, next) => {
  res.render('secret');
})




module.exports = router;