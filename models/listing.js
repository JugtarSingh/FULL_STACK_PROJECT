const mongoose =require("mongoose");
const review = require("./review");

const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{

        url:{
            type:String,
            default:"https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        },

        filename:{type: String,
        default: "listingimage"},
        
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }

    ]
})
listingSchema.post("findOneAndDelete",async(listing)=>{
   if(listing){
    await review.deleteMany({_id:{$in : listing.reviews}});
   }
})
const Listing= mongoose.model("Listing",listingSchema);
module.exports=Listing;
