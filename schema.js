const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().min(1).max(50).required(),
        description: Joi.string().min(1).max(50).required(),
        country: Joi.string().min(1).max(50).required(),
        price: Joi.number().min(0).required(),
        location: Joi.string().min(1).max(50).required(),
    }).required(),
});
