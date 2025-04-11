const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const areaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
    },
    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
    },
    pincode: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Area", areaSchema);
