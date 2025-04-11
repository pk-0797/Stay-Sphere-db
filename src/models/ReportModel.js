const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "host", "admin"],
      required: true,
    },
    isSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);