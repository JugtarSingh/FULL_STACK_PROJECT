const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initData = require("./data.js");


async function main() {
    mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main().then(()=>{
    console.log("Connect to DB");
})
.catch(err=>{console.log(err);});

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({...obj,owner:'67e2d0ceb06dabc7e74414c8'}));
    await Listing.insertMany(initData.data);
    console.log("Data was initalized");
};

initDB();