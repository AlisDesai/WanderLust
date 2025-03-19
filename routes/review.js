const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Review Validation
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body, { abortEarly: false });
  if (error) {
    let msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg); // Show specific validation errors
  } else next();
};

// Review Add
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review);
    await newReview.save();

    await listing.reviews.push(newReview);
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

//Delete review
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { listingId, reviewId } = req.params;
    await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${listingId}`);
  })
);

module.exports = router;
