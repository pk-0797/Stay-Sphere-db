const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
    },
    checkIn: {
      type: String,
    },
    checkOut: {
      type: String,
    },
    totalPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "users", 
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
