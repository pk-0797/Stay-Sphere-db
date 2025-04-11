const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String,  },
  
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    unique: true, // Ensures one review per booking
  },
  
},{
    timestamps:true
});

module.exports = mongoose.model("Review", ReviewSchema);
