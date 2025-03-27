const Listing =require("../models/listing.js");

module.exports.index=async(req,res)=>{
    const allListings = await Listing.find();
    res.render("index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
};

module.exports.showListing=async(req,res)=>{
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
};

module.exports.createListing=async(req,res)=>{
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
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    if(!list){
        req.flash("error","Listing you requested does not exist")
        res.redirect("/listings");
    }
    res.render("edit.ejs",{list});
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findOneAndUpdate({_id:id} ,req.body).then((result)=>{
        console.log(result);
    })
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id).then((result)=>{
        console.log(result);
    })
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
};