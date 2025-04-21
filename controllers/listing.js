const Listing = require("../models/listing.js");
module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}
module.exports.renderNewForm = (req,res)=>{
    // console.log(req.user);
    res.render("listings/new.ejs");
}
module.exports.showListing = async (req,res)=>{
    let {id} = req.params;  

    const listing = await Listing.findById(id).populate({path : "reviews",populate : {path : "author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
}
module.exports.filterListing = async(req,res)=>{
    let{key} = req.params;
    const allListings = await Listing.find({category:`${key}`});
    // console.log(allListings);
    res.render("listings/index.ejs",{allListings});
}
module.exports.searchListing = async(req,res)=>{
    let {searchContent} = req.body;
    // console.log(searchContent);
    const allListings = await Listing.find({$or : [{country: searchContent},{title:searchContent},{location:searchContent}]});
    // console.log(listing);
    res.render("listings/index.ejs",{allListings});
}
module.exports.createListing = async(req,res)=>{
    // let {title,description,image,price,country,location} = req.body;
    // console.log(req.body.listing);
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(req.body.listing);
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    console.log(newlisting);
    await newlisting.save();
    // if(!newlisting.description){
    //     throw new ExpressError(400,"Description is missing");
    // }
    // if(!newlisting.title){
    //     throw new ExpressError(400,"Title is missing");
    // } etc etc
    // itna likhne ke alava hm joi package use krenge.
    req.flash("success","New listing created!");
    res.redirect("/listings");
}
module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url ;
    originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let editedlisting = req.body.listing;
    let listing = await Listing.findByIdAndUpdate(id,{...editedlisting});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {url,filename};
        await listing.save();
    }


    req.flash("success","Listing updated");
    res.redirect(`/listings/${id}`);
}
module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");
    res.redirect("/listings");

}