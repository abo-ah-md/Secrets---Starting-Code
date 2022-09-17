require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const sesstion = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local").Strategy;

//const encrypt= require ("mongoose-encryption");
//const md5 = require ("md5");
//const bcrypt = require ("bcrypt")
//const saltRounds = 10;

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  sesstion({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/UsersDB");

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

/*passport.use(new LocalStrategy(
    function verify (username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
  */
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//UserSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]})

////////////////////////////////////////ROUTES/////////////////////////////////////////////

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
       if (err) {
        console.log(err);
       }
    });
    res.redirect("/")
})

app.get("/secrets", async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    Password: req.body.password,
  });
  req.logIn(newUser, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/register", (req, res, next) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username, active: true },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          console.log(req.session);
          console.log(req.sessionID);
          res.redirect("/secrets");
        });
      }
    }
  );
});

//----------------------for bcrypt
/*
    bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
        const newUser = new User ({
       
            email:req.body.username,
            //--------for md5
           // password:md5(req.body.password)
           password:hash
        }).save((err)=>{
            if (err) {
                console.log(err);
            }else res.render("secrets")
        });

    })
    */

app.listen(3000, () => {
  console.log("started");
});
