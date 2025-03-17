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

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

// Root
app.get(
  "/",
  wrapAsync(async (req, res) => {
    res.send("Root!");
  })
);

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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
