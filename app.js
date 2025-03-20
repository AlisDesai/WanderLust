const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// Middleware
app.use(cookieParser("secretcode"));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Database Connection
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main().catch((err) => console.log(err));

// Root Route
app.get("/", (req, res) => {
  res.cookie("Name", "Alis", { signed: true });
  res.send("SEnt")
});

app.get("/name", (req, res) => {
  if (req.signedCookies) {
    res.send("Welcome " + req.signedCookies.Name);
  }
  console.dir(req.cookies);
  res.send("Done");
});

// Route Handlers
app.use("/listings", listings);
app.use("/listings/:listingId/reviews", reviews);

// Handle Invalid URLs
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something Went Wrong!" } = err;
  res.status(status).render("error.ejs", { err });
});

// Start the Server
const PORT = 8080;
app.listen(PORT, () => console.log(`Hello, Future Billionare`));
