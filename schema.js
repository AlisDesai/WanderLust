const Joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().min(1).max(50).required(),
    description: Joi.string().min(1).max(50).required(),
    country: Joi.string().min(1).max(50).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().min(1).max(50).required(),
    image: Joi.string().uri().optional().allow(""), // ✅ Add this line
  }).required(),
});


module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().min(2).max(50).required(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(),
});
