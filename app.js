const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js"); // Corrected path
const PORT = 8080;
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const methodOverride = require("method-override");
const { count } = require("console");
const review = require("./models/review.js");

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Database Connection
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// Routes
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  })
);

// Root
app.get(
  "/",
  wrapAsync(async (req, res) => {
    res.send("Root!");
  })
);

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, "Bad Request!");
  } else next();
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body, { abortEarly: false });
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, "Bad Request!");
  } else next();
};

// Create and Save a Listing
app.get("/listing", (req, res) => {
  let l1 = new Listing({
    title: "Burj Khalifa",
    description: "jdkwbdcewc",
    price: 10000,
    location: "Dubai",
    country: "UAE",
  });
  l1.save();
});

// new route to add new listing
app.get(
  "/listings/new",
  wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
  })
);

//  route to Save new listing
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//update put route
app.put(
  "/listings/:id",
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

//update route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// show specific route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

// Delete route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

app.delete(
  "listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    // res.send("DELETED");
    res.redirect(`/listings/${id}`);
  })
);

// if user go to invalid url
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
// Error handling
app.use((err, req, res, next) => {
  let { status = 500, message = "Something Went Wrong!" } = err;
  res.render("error.ejs", { err });
});

// Start the server
app.listen(PORT, () => console.log("Hello, Future Billionare"));
