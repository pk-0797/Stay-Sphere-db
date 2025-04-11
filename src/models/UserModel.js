const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  confirmPassword: {
    type: String,
  },
  phoneNo: {
    type: Number,
  },
  age: {
    type: Number,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: "roles",
  },
  role: {
    type: String,
    enum: ["user", "host","admin"],
  },
  instaId: {
    type: String,
  },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Property" }],
});

module.exports = mongoose.model("users", userSchema);
