//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
//const encrypt= require ("mongoose-encryption");
//const md5 = require ("md5");
//const bcrypt = require ("bcrypt")
//const saltRounds = 10;
const sesstion = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}))


app.use(sesstion({
    secret:"secrete",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/UsersDB');

const UserSchema= new mongoose.Schema({
    username:String,
    password:String,
})

UserSchema.plugin(passportLocalMongoose);


const User =  mongoose.model("User",UserSchema)
passport.use(  User.createStrategy())

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

//UserSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]})







app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/secrets",(req,res)=>{
   res.render("secrets")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",(req,res)=>{
    
        const userName = req.body.username;
        //------------------------for md5
        // const password = md5(req.body.password);
         
         
         //----------------------for bcrypt
        /* User.findOne({email:userName},(erro,result)=>{
             if (erro) {
                 console.log(erro);
             }else {
                 if (result) {
                   bcrypt.compare(req.body.password,result.password,(err,cleard)=>{
                    if (cleard) { res.render("secrets")}else{console.log(err)}
                

                   
                     })
                 }
             }
         })
         */
})











app.get("/register",(req,res)=>{
    res.render("register")
})

app.post("/register",async(req,res)=>{

    const username =req.body.userame
    const password= req.body.password

   const newUser=   User.register({username:req.body.username},req.body.password,(err,newUser)=>{
        
if (err) {
    console.log(err);
   
}
else{
   req.logIn(newUser,(err)=>{
    if (err) {
        console.log(err);
    }else{
        console.log("done");
        res.redirect("/secrets")
    
    }

   })
   
}





    })


})












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
   






app.listen(3000,()=>{
    console.log("started");
})