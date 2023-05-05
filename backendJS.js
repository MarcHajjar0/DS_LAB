const express = require('express');
const app = express();
const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const mysql2 = require('mysql2');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
var con = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'bohemianrhaspody1'
});
con.connect((err)=>{
    if(err){
        console.log(err);
    }
});
const sessionSecret = crypto.randomBytes(32).toString('hex');
app.use(expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
var command1 = "CREATE DATABASE IF NOT EXISTS cafeRJM \n USE cafeRJM";
con.query(command1);
var command2 = "CREATE TABLE IF NOT EXISTS User(uname VARCHAR(150), PRIMARY KEY (uname), Name VARCHAR(150) NOT NULL, Password VARCHAR(150) NOT NULL";
con.query(command2);
var command3 = "CREATE TABLE IF NOT EXISTS Food(id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), Name VARCHAR(150) NOT NULL, Email VARCHAR(150) NOT NULL, Password VARCHAR(150) NOT NULL, DateOfBirth DATE CHECK (DateOfBirth>'01-01-1920') NOT NULL, Number VARCHAR(20) NOT NULL, Role VARCHAR(150) NOT NULL)";
con.query(command3);
app.set('views', './views');
app.set('view engine','ejs');
app.use(express.static(__dirname+'/public'));
app.get('/', (req,res,next)=>{
    
    res.redirect('/home');
});
app.get('/home', (req,res)=>{
    const user = req.session.user;
    if(!user){
        res.render('index');
    }else{
        res.render('index-signed', {
            name: user.name
        });
        }
    });
app.get('/order', (req,res)=>{
    const user = req.session.user;
    if(!user){
        res.redirect('/login');
    }else{
        res.render('order', {
            name: user.name
        });
        }
    }
);
app.get('/login', (req,res)=>{
    res.render('sign-in');
});
app.get('/signup',(req,res)=>{
    res.render('sign-up', {
        message: ""
    });
});
app.post('/login', (req,res)=>{
    const uname = req.body.uname;
    const password = req.body.passcode;
        con.query('SELECT * FROM User WHERE uname = ?', [], (error, results, fields) => {
            if(error){
                console.log(error);
            }
            if (results.length == 0) {
              res.render("sign-in", {
                emessage: "Invalid username, please try again",
                pmessage:""
              });
            } else if(results[0].password==password){
              const user = results[0];
                req.session.user = user;
                res.render("index-signed", {
                  name: user.name
                });
              }else{
                res.render("sign-in",{
                    emessage:"",
                    pmessage: "Wrong Password, please try again"
                  });
              }
            });
});
app.post('/signup',(req,res)=>{
    var mistakesNum = 0;
    var mistakes = [];
    const name = req.body.name;
    const nameL = name.length;
    if(nameL<5){
        mistakesNum++;
        mistakes.push("Name should at least have 5 characters");
    }
    const pass = req.body.password;
    const passL = pass.length;
    if((req.body.password != req.body.rpassword) && passL >= 7){
        mistakesNum++;
        mistakes.push("Passwords are not the same, please try again");
    }
    if(passL < 7){
        mistakesNum++;
        mistakes.push("Password should at least be 7 characters");
    }
    const username = req.body.uname;
    const usernameL = username.length;
    if(usernameL<5){
        mistakesNum++;
        mistakes.push("Username should at least be at least 5 characters");
    }
    var message = "";
    if(mistakes.length>0){
        res.render("sign-up", {
            message: mistakes
        });
    }else{
        con.query("INSERT INTO User(uname, Name, Password) VALUES(?,?,?)",[req.body.uname, req.body.name, req.body.passcode]);
        res.cookie('user', req.body.uname);
        req.session.user = {
            uname: req.body.uname,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        }
        var n = con.query("SELECT Name FROM User WHERE uname = ?", req.body.uname);
        res.render("index-signed", {name: n});
    }
});
app.get('/signout', (req,res)=>{
    req.session.destroy();
    res.redirect('/login');
});
var server = app.listen(3306,()=>{
    console.log('listening at port 3306');
});