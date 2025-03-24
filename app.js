const express=require("express");
const app=express();
const path=require("path");
const methodOverride = require('method-override');
const mongoose=require("mongoose");
const Listing =require("./models/listing.js");
const engine = require('ejs-mate');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const  Review  = require("./models/review.js");
const { reviewSchema } = require("./schema.js");
const review = require("./models/review.js");


app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"/public")));
app.set("views engine","ejs");
app.set("views",path.join(__dirname,"/views/listings"));

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
async function main() {
    mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main().then(()=>{
    console.log("Connect to DB");
})
.catch(err=>{console.log(err);})

app.get("/",(req,res)=>{
    res.send("Hi i am root")
})

const validateListing= (req,res,next)=>{
    let {error}= listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

const validateReview= (req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find();
    res.render("index.ejs",{allListings});
}))

app.get ("/listings/new", (req,res)=>{
    res.render("new.ejs");
});

//Create 
app.post("/listings",validateListing,wrapAsync(async(req,res)=>{
    // if(!req.body){
    //     throw new ExpressError(400,"Send a valid data for listing");
    // }
    const data=req.body
    const list=new Listing(data);
    await list.save() .then ((res)=>{
        console.log(res)
    })
    res.redirect("/listings");
}));

app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    res.render("edit.ejs",{list});
}));

//Update
app.post("/listings/:id/edit",validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findOneAndUpdate({_id:id} ,req.body).then((result)=>{
        console.log(result);
    })
    res.redirect("/listings");
}));

//Delete
app.get("/listings/:id/delete", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id).then((result)=>{
        console.log(result);
    })
    res.redirect("/listings");
}));

// Reviews
// post route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res)=>{
    let listing= await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${req.params.id}`);
}));

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId }= req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));



// show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id).populate("reviews");
    res.render("show.ejs",{list});
}));

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