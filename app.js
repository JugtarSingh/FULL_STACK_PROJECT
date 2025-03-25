const express=require("express");
const app=express();
const path=require("path");
const methodOverride = require('method-override');
const mongoose=require("mongoose");
const engine = require('ejs-mate');
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const flash =require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");

// Router
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const user=require("./routes/user.js");

app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"/public")));
app.set("views engine","ejs");
app.set("views",path.join(__dirname,"/views/listings"));
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));

const sessionOptions={
    secret:"Mysuperserectcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}

async function main() {
    mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main().then(()=>{
    console.log("Connect to DB");
})
.catch(err=>{console.log(err);})

app.get("/",(req,res)=>{
    res.send("Hi i am root")
});


app.use(session(sessionOptions));
app.use(flash());

// use of passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// local variables
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser= req.user;
    next();
})


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",user);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});
app.use((err,req,res,next)=>{
    let {statusCode , message}=err;
    res.render("error.ejs",{err});
    // res.status(statusCode).send(message);
});


app.listen(8080,()=>{
    console.log("Sever is listening to port 8080");
}); 