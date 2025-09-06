const express= require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing =require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudinary.js");
// const upload = multer({storage});
const parser = multer({ storage: storage });

router.route("/")
    .get(wrapAsync(listingController.index))  // index 
    .post(isLoggedIn,
        parser.single("image[url]"),
        validateListing,
        wrapAsync(listingController.createListing));
    // .post(
    //     parser.single("image[url]"),(req,res)=>{
    //     res.send(req.file);
    //     }
    // )

//new route
router.get ("/new",
     isLoggedIn,
     listingController.renderNewForm);

// show route
router.get("/:id",
    wrapAsync(listingController.showListing));


router.route("/:id/edit")
    .get(isLoggedIn,           //edit
        isOwner,
        wrapAsync(listingController.renderEditForm))
    .post(isLoggedIn,          //Update
            isOwner,
            parser.single("image[url]"),
            validateListing,
            wrapAsync(listingController.updateListing));

//Delete
router.get("/:id/delete",
     isLoggedIn,
     isOwner ,
     wrapAsync(listingController.deleteListing));

module.exports=router;