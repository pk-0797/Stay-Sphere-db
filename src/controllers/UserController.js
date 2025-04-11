const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mailUtil = require("../utils/MailUtil");
const jwt = require("jsonwebtoken");
const secret = "secret";

const loginUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const foundUserFromEmail = await userModel
    .findOne({ email: email })
    .populate("roleId");
  console.log(foundUserFromEmail);

  if (foundUserFromEmail != null) {
    const isMatch = bcrypt.compareSync(password, foundUserFromEmail.password);

    if (isMatch == true) {
      res.status(200).json({
        message: "login success",
        data: foundUserFromEmail,
      });
    } else {
      res.status(404).json({
        message: "invalid cred..",
      });
    }
  } else {
    res.status(404).json({
      message: "Email not found..",
    });
  }
};

const signup = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const hashedconfirmPassword = bcrypt.hashSync(
      req.body.confirmPassword,
      salt
    );
    req.body.password = hashedPassword;
    req.body.confirmPassword = hashedconfirmPassword;
    const createdUser = await userModel.create(req.body);

    await mailUtil.sendingMail(
      createdUser.email,
      "welcome to Stay Sphere",
      "this is welcome mail from Stay Sphere"
    );

    res.status(201).json({
      message: "user created..",
      data: createdUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error",
      data: err,
    });
  }
};

const addUser = async (req, res) => {
  const savedUser = await userModel.create(req.body);
  res.json({
    message: "User Saved Successfully",
    data: savedUser,
  });
};
const getAllUsers = async (req, res) => {
  const users = await userModel.find().populate("roleId");
  res.json({
    message: "User fetched successfully..",
    data: users,
  });
};

const getUserById = async (req, res) => {
  const foundUser = await userModel.findById(req.params.id);
  res.json({
    message: "user fetched successfully..",
    data: foundUser,
  });
};

const deleteUserById = async (req, res) => {
  const deletedUser = await userModel.findByIdAndDelete(req.params.id);
  res.json({
    message: "user deleted Successfully..",
    data: deletedUser,
  });
};

const updateUserById = async (req, res) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Only notify if the update is done by admin
    if (req.body.updatedByAdmin === true) {
      const mailMessage = `
Hello ${updatedUser.fullName || "User"},

Your account details have been updated by an administrator.

If you did not request or expect these changes, please contact our support team immediately.

Thank you,
Stay Sphere Support Team
      `;

      await mailUtil.sendingMail(
        updatedUser.email,
        "Your Account Was Updated by Admin",
        mailMessage
      );
    }

    res.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error,
    });
  }
};

const getUserWishlist = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.userId)
      .populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ data: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(propertyId)) {
      user.wishlist.push(propertyId);
      await user.save();
    }

    // Fetch updated wishlist
    const updatedUser = await userModel.findById(userId).populate("wishlist");

    res
      .status(200)
      .json({ message: "Added to wishlist", data: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    // Fetch updated wishlist
    const updatedUser = await userModel.findById(userId).populate("wishlist");

    res
      .status(200)
      .json({ message: "Removed from wishlist", data: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;
  const foundUser = await userModel.findOne({ email: email });
  console.log(email);
  if (foundUser) {
    const token = jwt.sign(foundUser.toObject(), secret);
    console.log(token);
    const url = `http://localhost:5173/resetpassword/${token}`;
    const mailContent = `<html>
                          <a href ="${url}">rest password</a>
                          </html>`;
    //email...
    await mailUtil.sendingMail(foundUser.email, "reset password", mailContent);
    res.json({
      message: "reset password link sent to mail.",
    });
  } else {
    res.json({
      message: "user not found register first..",
    });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, secret);

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await userModel.findByIdAndUpdate(decoded._id, {
      password: hashedPassword,
    });

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error in resetpassword:", error);
    res.status(500).json({ message: "Invalid or expired token." });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || userId === "null") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    console.log(`Logging out user: ${userId}`);

    // Properly disconnect WebSocket if in use
    if (global.io) {
      for (let [id, socket] of global.io.sockets.sockets) {
        if (socket.userId === userId) {
          console.log(`Disconnecting socket: ${id}`);
          socket.disconnect(true);
        }
      }
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error during logout", error });
  }
};

module.exports = {
  addUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  signup,
  loginUser,
  updateUserById,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  forgotPassword,
  resetpassword,
  logoutUser,
};
