const mongoose = require("mongoose");
const Review = require("../models/ReviewModel");

exports.createReview = async (req, res) => {
    try {
        let { guestId, propertyId, bookingId, rating, reviewText } = req.body;

        // Convert rating to a floating number
        rating = parseFloat(rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Invalid rating value. It must be between 1 and 5." });
        }

        const existingReview = await Review.findOne({ bookingId });

        if (existingReview) {
            return res.status(200).json({ message: "Review already exists", review: existingReview });
        }

        const newReview = new Review({ guestId, propertyId, bookingId, rating, reviewText });
        await newReview.save();

        res.status(201).json({ message: "Review created successfully", review: newReview });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


exports.getReviewByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const review = await Review.findOne({ bookingId });

        if (!review) {
            return res.status(404).json({ message: "No review found for this booking" });
        }

        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

  
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('guestId propertyId');
        res.status(200).json({
            message: "Review found successfully",
            data: reviews,
          });
    } catch (error) {
        res.status(500).json({
            message: "review doesn't found",
          });
    }
};