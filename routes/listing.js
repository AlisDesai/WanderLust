const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js"); // Corrected path

// Validate Middleware
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log("Validation Error:", error.details); // Debugging line
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg); // Show actual error in response
  } else next();
};


router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  })
);

router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) throw new ExpressError(404, "Listing Not Found");
    res.render("listings/show.ejs", { listing });
  })
);

router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    let { NewTitle, NewDes, Newimg, NewPrice, NewCountry, NewLocation } =
      req.body;
    if (!req.body.listing) {
      throw new ExpressError(400, "Please Enter All Field Data");
    }
    await Listing.findByIdAndUpdate(id, {
      title: NewTitle,
      description: NewDes,
      image: { url: Newimg },
      price: NewPrice,
      country: NewCountry,
      location: NewLocation,
    });
    res.redirect("/listings");
  })
);

router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing Not Found");
    res.render("listings/edit.ejs", { listing });
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

module.exports = router;
