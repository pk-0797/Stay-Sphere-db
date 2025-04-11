const propertyModel = require("../models/PropertyModel");
const multer = require("multer");
const path = require("path");
const cloudinaryUtil = require("../utils/CloudinaryUtil");
const { sendingMail } = require("../utils/MailUtil");

const updatePropertyDetails = async (req, res) => {
  try {
    const updatedProperty = await propertyModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("userId");

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // First, respond with success (update complete)
    res.status(200).json({
      message: "Property updated successfully. Sending email...",
      data: updatedProperty,
    });

    // Then, attempt to send mail (but don't block update if it fails)
    const hostEmail = updatedProperty.userId.email;
    const hostName = updatedProperty.userId.fullName;
    const subject = "Property Details Updated by Admin";
    const message = `Hi ${hostName},\n\nYour property titled "${updatedProperty.title}" has been updated by the admin.\n\nThanks,\nStaySphere Team`;

    sendingMail(hostEmail, subject, message).catch((emailError) => {
      console.error("Failed to send email to host:", emailError.message);
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("image");

const addPropertyWithFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
    } else {
      const cloundinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(
        req.file
      );
      console.log(cloundinaryResponse);
      console.log(req.body);

      //store data in database
      req.body.propertyURL = cloundinaryResponse.secure_url;
      const savedProperty = await propertyModel.create(req.body);

      res.status(200).json({
        message: "Property added successfully",
        data: savedProperty,
      });
    }
  });
};

// const addProperty = async (req, res) => {
//   try {
//     const savedProperty = await propertyModel.create(req.body);
//     res.status(201).json({
//       message: "Property added successfully",
//       data: savedProperty,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err });
//   }
// };

const getAllPropertiesByUserId = async (req, res) => {
  try {
    const properties = await propertyModel
      .find({ userId: req.params.userId })
      .populate("stateId cityId areaId userId");
    if (properties.length === 0) {
      res.status(404).json({ message: "No properties found" });
    } else {
      res.status(200).json({
        message: "Property found successfully",
        data: properties,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await propertyModel
      .find()
      .populate("cityId stateId areaId").populate("userId", "fullName email phoneNo");
    res.status(200).json({
      message: "All Properties Fetched Successfully.",
      data: properties,
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

const getPropertyByStateId = async (req, res) => {
  try {
    const properties = await propertyModel
      .find({ stateId: req.params.stateId })
      .populate("cityId stateId areaId");
    res.status(200).json({
      message: "Property found",
      data: properties,
    });
  } catch (err) {
    res.status(500).json({
      message: "Property doesn't found",
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await propertyModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePropertyPrice = async (req, res) => {
  try {
    const { totalPrice } = req.body;

    if (!totalPrice) {
      return res.status(400).json({ message: "Price is required for updating." });
    }

    const updatedProperty = await propertyModel.findByIdAndUpdate( // ✅ Fixed `propertyModel`
      req.params.id,
      { $set: { totalPrice } }, 
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Price updated successfully", data: updatedProperty });
  } catch (err) {
    console.error("Error updating price:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const getPropertyWithoutUserId = async (req, res) => {
  try {
    console.log("Fetching property ID:", req.params.id); // Debugging

    const property = await propertyModel.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    res.status(200).json(property);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
  addPropertyWithFile,
  getProperties,
  getPropertyByStateId,
  getAllPropertiesByUserId,
  getPropertyById,
  deleteProperty,
  updatePropertyPrice,
  getPropertyWithoutUserId,
  updatePropertyDetails
};
