const express= require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing =require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn}=require("../middleware.js");


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


//Index
router.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find();
    res.render("index.ejs",{allListings});
}))

//new route
router.get ("/new", isLoggedIn,(req,res)=>{
    
    res.render("new.ejs");
});

// show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id).populate("reviews");
    if(!list){
        req.flash("error","Listing you requested does not exist")
        res.redirect("/listings");
    }
    res.render("show.ejs",{list});
}));

//Create Route
router.post("/", isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    // if(!req.body){
    //     throw new ExpressError(400,"Send a valid data for listing");
    // }
    const data=req.body
    const list=new Listing(data);
    await list.save() .then ((res)=>{
        console.log(res);
    })
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

//edit
router.get("/:id/edit", isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    if(!list){
        req.flash("error","Listing you requested does not exist")
        res.redirect("/listings");
    }
    res.render("edit.ejs",{list});
}));

//Update
router.post("/:id/edit", isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findOneAndUpdate({_id:id} ,req.body).then((result)=>{
        console.log(result);
    })
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete
router.get("/:id/delete", isLoggedIn, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id).then((result)=>{
        console.log(result);
    })
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
}));

module.exports=router;