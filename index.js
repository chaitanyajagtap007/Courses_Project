var express = require("express");
var adminRoute = require("./routes/admin");
var userRoute = require("./routes/user");
var bodyparser = require("body-parser");
var upload = require("express-fileupload");
var session = require("express-session");
var app=express();  
app.use(express.static("public/"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(session({
    secret:"Crj",
    resave:true,
    saveUninitialized:true
}));

app.use("/",userRoute);
app.use("/admin",adminRoute);

app.get("/",function(req,res)
{
    res.send("hello");
});


app.listen(3000);