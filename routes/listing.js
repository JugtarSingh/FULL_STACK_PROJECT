const express= require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing =require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");

//Index
router.get("/",
    wrapAsync(listingController.index));

//new route
router.get ("/new",
     isLoggedIn,
     listingController.renderNewForm);

// show route
router.get("/:id",
    wrapAsync(listingController.showListing));

//Create Route (Create new listing )
router.post("/", 
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListing));

//edit
router.get("/:id/edit",
     isLoggedIn,
     isOwner,
     wrapAsync(listingController.renderEditForm));

//Update
router.post("/:id/edit", 
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing));

//Delete
router.get("/:id/delete",
     isLoggedIn,
     isOwner ,
     wrapAsync(listingController.deleteListing));

module.exports=router;