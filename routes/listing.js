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

    // Create an object that matches your schema's expectations
    const listingData = {
      listing: {
        title: req.body.NewTitle,
        description: req.body.NewDes,
        image: { url: req.body.Newimg, filename: "custom_filename" },
        price: req.body.NewPrice,
        country: req.body.NewCountry,
        location: req.body.NewLocation,
      },
    };

    // Then validate this data
    const { error } = listingSchema.validate(listingData);
    if (error) {
      throw new ExpressError(
        400,
        error.details.map((el) => el.message).join(", ")
      );
    }

    // Then update with this data
    await Listing.findByIdAndUpdate(id, listingData.listing);

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
  "/:id/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ success: true, message: "Review deleted!" });
  })
);

module.exports = router;
