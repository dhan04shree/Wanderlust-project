if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
//ejs
const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views/"));
// const Listing = require("./models/listing.js");
const methodOverride = require("method-override");

app.use(express.static(path.join(__dirname,"/public/css")));
app.use(express.static(path.join(__dirname,"/public/js")));
app.use(express.static(path.join(__dirname,"/public/icons")));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

const googleRoute = require("./routes/google.js");

//ejs-mate
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; //1.M
const dbUrl = process.env.ATLASDB_URL;//1.C

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=> console.log(err));

async function main(){
    await mongoose.connect(MONGO_URL);
} //2.M
async function main(){
    await mongoose.connect(dbUrl);
}//2.C
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGOSESSION STORE",err);
});
const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly :true,
    }
}
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
// app.get("/listings/category/:key",async(req,res)=>{
//     let{key} = req.params;
//     const allListings = await Listing.find({category:`${key}`});
//     // console.log(allListings);
//     res.render("listings/index.ejs",{allListings});
// });
// app.post("/listings/search/?",async(req,res)=>{
//     let {searchContent} = req.body;
//     // console.log(searchContent);
//     const allListings = await Listing.find({country: searchContent});
//     // console.log(listing);
//     res.render("listings/index.ejs",{allListings});
// });
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.use("/auth/google", googleRoute);

app.all("*",(req,res,next)=>{
    
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
    let{status=500,message="Something went wrong"} = err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});