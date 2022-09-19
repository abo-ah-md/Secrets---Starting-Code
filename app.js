require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const sesstion = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require("passport-github2").Strategy
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "ejs");





/////////////////////////////////////////////////outhincation prep///////////////////////////////////// 
app.use(
  sesstion({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());



////////////////////////////////////////////////////////////DBConnect///////////////////////////////////
mongoose.connect("mongodb://localhost:27017/UsersDB");

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);





const User = mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
});
})



passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  
},
 async function  (accessToken, refreshToken, profile, cb) {
  try{
  await User.findOrCreate({ googleId: profile.id },  function  (err, user,) {
    if (err) {
      console.log(err);
    }
    return cb(err, user);
  }); 
}catch(err){console.log(err);}
}
));













///////////////////////////////////////////////////////ROUTES///////////////////////////////////////////////
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});

app.get("/secrets", async (req, res, next) => {
 User.find({"secret":{$ne:null}},(err,foundUser)=>{
  if (err) {
    console.log(err);
  }else {
    console.log(foundUser);
      res.render("secrets",{usersecret:foundUser});
  }
 })
});

app.get("/submit",(req,res)=>{
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
})
app.post("/submit",(req,res)=>{


 const submetedSecrets= req.body.secret;
 User.findById(req.user.id,(err,foundUser)=>{
  if (err) {
    console.log(err);
  }else {
    if (foundUser){
    foundUser.secret= submetedSecrets;
    foundUser.save(()=>{res.redirect("/secrets")});
    };
  };
 });
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

app.listen(3000, () => {
  console.log("started");
});
