const express = require('express');
const router = express.Router();
const { createReview, getReviews, getReviewByBookingId } = require("../controllers/ReviewController");

router.post('/createreview', createReview);
router.get('/getallreviews', getReviews);
router.get('/getreview/:bookingId', getReviewByBookingId);

module.exports = router;
