const express= require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing =require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");

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
    const list= await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{path:"author"}})
    .populate("owner");
    if(!list){
        req.flash("error","Listing you requested does not exist")
        res.redirect("/listings");
    }
    res.render("show.ejs",{list});
}));

//Create Route (Create new listing )
router.post("/", isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    // if(!req.body){
    //     throw new ExpressError(400,"Send a valid data for listing");
    // }
    const data=req.body
    const list=new Listing(data);
    list.owner= req.user._id;
    await list.save() .then ((res)=>{
        console.log(res);
    })
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

//edit
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    if(!list){
        req.flash("error","Listing you requested does not exist")
        res.redirect("/listings");
    }
    res.render("edit.ejs",{list});
}));

//Update
router.post("/:id/edit", isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findOneAndUpdate({_id:id} ,req.body).then((result)=>{
        console.log(result);
    })
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete
router.get("/:id/delete", isLoggedIn,isOwner ,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id).then((result)=>{
        console.log(result);
    })
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
}));

module.exports=router;