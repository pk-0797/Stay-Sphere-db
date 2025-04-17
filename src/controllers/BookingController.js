const bookingModel = require("../models/BookingModel");
const propertyModel = require("../models/PropertyModel");
const Notification = require("../models/NotificationModel");
const { sendingMail } = require("../utils/MailUtil");
const io = global.io; 

const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await bookingModel
      .findByIdAndUpdate(bookingId, { status: "Confirmed" }, { new: true })
      .populate("guestId propertyId"); // Populate guest and property data

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create notification for the user
    const notification = new Notification({
      userId: booking.guestId._id,
      message: "Your booking has been confirmed by the host.",
    });

    await notification.save();

    // Emit real-time notification
    io.to(booking.guestId._id.toString()).emit("newNotification", {
      message: "Your booking has been confirmed by the host.",
    });

    // Compose detailed confirmation email
    const emailContent = `
Hi ${booking.guestId.fullName},

Great news! Your booking has been confirmed by the host.

Booking Details:
-----------------------
Property: ${booking.propertyId.title}
Location: ${booking.propertyId.address || "Not specified"}
Check-in Date: ${new Date(booking.checkIn).toLocaleDateString()}
Check-out Date: ${new Date(booking.checkOut).toLocaleDateString()}
Total Price: ₹${booking.totalPrice}

We hope you have a comfortable and enjoyable stay!

Best regards,
Stay Sphere Team
    `;

    // Send email with try/catch for safety
    try {
      console.log("Sending confirmation email to:", booking.guestId.email);
      await sendingMail(
        booking.guestId.email,
        "Booking Confirmed",
        emailContent
      );
      console.log("Confirmation email sent successfully.");
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    res.status(200).json({
      message: "Booking confirmed, notification and email sent.",
      data: booking,
    });
  } catch (err) {
    console.error("Error in confirmBooking:", err);
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await bookingModel
      .findByIdAndUpdate(
        bookingId,
        {
          status: "Cancelled",
          cancellationReason: reason || "Not specified",
        },
        { new: true }
      )
      .populate("guestId propertyId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const notificationMessage = `Your booking was cancelled by the host. Reason: ${
      reason || "No reason provided"
    }`;

    const notification = new Notification({
      userId: booking.guestId._id,
      message: notificationMessage,
    });
    await notification.save();

    io.to(booking.guestId._id.toString()).emit("newNotification", {
      message: notificationMessage,
    });

    const emailContent = `
Hi ${booking.guestId.fullName},

We're sorry to inform you that your booking has been cancelled by the host.

Booking Details:
-----------------------
Property: ${booking.propertyId.title}
Location: ${booking.propertyId.address || "Not specified"}
Check-in Date: ${new Date(booking.checkIn).toLocaleDateString()}
Check-out Date: ${new Date(booking.checkOut).toLocaleDateString()}
Total Price: ₹${booking.totalPrice}

You can explore other stays on our platform. We're here to help if you need assistance.

Best regards,
Stay Sphere Team
    `;

    try {
      await sendingMail(
        booking.guestId.email,
        "Booking Cancelled",
        emailContent
      );
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
    }

    res.status(200).json({
      message: "Booking cancelled, notification and email sent.",
      data: booking,
    });
  } catch (err) {
    console.error("Error in cancelBooking:", err);
    res.status(500).json({ message: err.message });
  }
};
// 1st
// const addBooking = async (req, res) => {
//   try {
//     const { guestId, propertyId, checkIn, checkOut, totalPrice } = req.body;

//     // Prevent duplicate bookings for the same property and user
//     const existingBooking = await bookingModel.findOne({
//       guestId,
//       propertyId,
//       checkIn,
//       checkOut,
//       status: "Pending", // Avoid duplicate pending requests
//     });

//     if (existingBooking) {
//       return res
//         .status(400)
//         .json({ message: "Booking request already sent for these dates!" });
//     }

//     // Fetch property to get host ID
//     const property = await propertyModel.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     const hostId = property.userId;

//     // Create new booking request
//     const newBooking = await bookingModel.create({
//       guestId,
//       propertyId,
//       hostId,
//       checkIn,
//       checkOut,
//       totalPrice,
//       status: "Pending",
//     });

//     res
//       .status(201)
//       .json({ message: "Booking request sent to host.", data: newBooking });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

//2nd
// const addBooking = async (req, res) => {
//   try {
//     const { guestId, propertyId, checkIn, checkOut, totalPrice } = req.body;

//     // Overlap check: block any booking with status other than 'Cancelled'
//     const overlappingBooking = await bookingModel.findOne({
//       propertyId,
//       status: { $ne: "Cancelled" },
//       $or: [
//         { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } }
//       ]
//     });

//     if (overlappingBooking) {
//       return res.status(400).json({
//         message: `Property is already booked or requested from ${new Date(overlappingBooking.checkIn).toLocaleDateString()} to ${new Date(overlappingBooking.checkOut).toLocaleDateString()}.`
//       });
//     }

//     const property = await propertyModel.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     const hostId = property.userId;

//     const newBooking = await bookingModel.create({
//       guestId,
//       propertyId,
//       hostId,
//       checkIn,
//       checkOut,
//       totalPrice,
//       status: "Pending",
//     });

//     res.status(201).json({
//       message: "Booking request sent to host.",
//       data: newBooking,
//     });

//   } catch (err) {
//     console.error("Error in addBooking:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
//hotels
const addBooking = async (req, res) => {
  try {
    const { guestId, propertyId, checkIn, checkOut, totalPrice } = req.body;

    // Get the property
    const property = await propertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const hostId = property.userId;

    const isHotel = property.propertyType?.toLowerCase() === "hotel"; // ✅ ensure case-insensitive

    if (isHotel) {
      // 🏨 Logic for hotels: allow multiple bookings up to availableRooms
      const overlappingBookingsCount = await bookingModel.countDocuments({
        propertyId,
        status: { $in: ["Pending", "Confirmed"] },
        $or: [
          {
            checkIn: { $lte: new Date(checkOut) },
            checkOut: { $gte: new Date(checkIn) },
          },
        ],
      });

      if (overlappingBookingsCount >= property.availableRooms) {
        return res.status(400).json({
          message: `All ${property.availableRooms} room(s) are already booked for the selected dates.`,
        });
      }
    } else {
      // 🏠 Logic for non-hotels: block all overlaps
      const overlappingBooking = await bookingModel.findOne({
        propertyId,
        status: { $in: ["Pending", "Confirmed"] },
        $or: [
          {
            checkIn: { $lte: new Date(checkOut) },
            checkOut: { $gte: new Date(checkIn) },
          },
        ],
      });

      if (overlappingBooking) {
        return res.status(400).json({
          message: `This property is already booked for the selected dates.`,
        });
      }
    }

    // ✅ Create the booking
    const newBooking = await bookingModel.create({
      guestId,
      propertyId,
      hostId,
      checkIn,
      checkOut,
      totalPrice,
      status: "Pending",
    });

    res.status(201).json({
      message: "Booking request sent to host.",
      data: newBooking,
    });

  } catch (err) {
    console.error("Error in addBooking:", err.message);
    res.status(500).json({ message: err.message });
  }
};


const getBookingsByHostId = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ hostId: req.params.hostId })
      .populate("guestId", "fullName email phoneNo"); // Populate guest details

    res.status(200).json({ message: "Bookings found", data: bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addBookingByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { guestId, checkIn, checkOut, totalPrice, status } = req.body;

    if (!guestId || !checkIn || !checkOut || !totalPrice || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBooking = await bookingModel.create({
      propertyId,
      guestId,
      checkIn,
      checkOut,
      totalPrice,
      status,
    });

    res.status(201).json({ message: "Booking successful", data: newBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllBooking = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find()
      .populate("guestId", "fullName email phoneNo")
      .populate("propertyId")
      .populate("hostId", "fullName email phoneNo");

    const formattedBookings = bookings.map((booking) => {
      return {
        ...booking.toObject(),
        bookingDate: new Date(booking.createdAt).toLocaleDateString("en-GB", {
          timeZone: "Asia/Kolkata",
        }), // e.g. "14/03/2025"
        bookingTime: new Date(booking.createdAt).toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
        }), // e.g. "10:30:45 AM"
      };
    });

    res.status(200).json({
      message: "All bookings fetched successfully",
      data: formattedBookings,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Error fetching bookings",
    });
  }
};

const getAllBookingsByUserId = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ guestId: req.params.userId })
      .populate("guestId propertyId");
    if (bookings.length === 0) {
      res.status(404).json({ message: "No bookings found" });
    } else {
      res.status(200).json({
        message: "Booking found successfully",
        data: bookings,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPropertyByBookingId = async (req, res) => {
  try {
    const booking = await bookingModel
      .findById(req.params.bookingId)
      .populate("guestId propertyId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({
      message: "Property fetched successfully",
      data: booking.propertyId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHostByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find the booking that contains the propertyId and retrieve the hostId
    const booking = await bookingModel
      .findOne({ propertyId })
      .populate("hostId", "fullName email");

    if (!booking) {
      return res
        .status(404)
        .json({ message: "No host found for this property" });
    }

    res.status(200).json({ message: "Host found", data: booking.hostId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBookingByHost = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    const updatedBooking = await bookingModel
      .findByIdAndUpdate(bookingId, updates, { new: true })
      .populate("guestId propertyId");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const guest = updatedBooking.guestId;
    const property = updatedBooking.propertyId;

    // Create & Save Notification
    const message = `Your booking for "${
      property?.title || "a property"
    }" has been updated by the host.`;
    const notification = new Notification({
      userId: guest._id,
      message,
    });
    await notification.save();

    // Emit Socket.IO Notification
    io.to(guest._id.toString()).emit(`notification-${guest._id}`, {
      _id: notification._id,
      userId: guest._id,
      message,
      createdAt: notification.createdAt,
      isRead: false,
    });

    // Send Email (non-blocking)
    try {
      const subject = "Your booking has been updated";
      const text = `
Hi ${guest.fullName},

Your booking for "${
        property?.title || "a property"
      }" has been updated by the host.

Updated details:
- Check-In: ${new Date(updatedBooking.checkIn).toLocaleDateString()}
- Check-Out: ${new Date(updatedBooking.checkOut).toLocaleDateString()}
- Total Price: ₹${updatedBooking.totalPrice}

Thank you for booking with StaySphere!
      `.trim();

      await sendingMail(guest.email, subject, text);
      console.log("Email sent to:", guest.email);
    } catch (emailErr) {
      console.error("❌ Email failed to send:", emailErr.message);
    }

    res.status(200).json({
      message: "Booking updated, notification and email sent.",
      data: updatedBooking,
    });
  } catch (err) {
    console.error("❌ Booking update failed:", err.message);
    res
      .status(500)
      .json({ message: "Something went wrong while updating booking." });
  }
};

const getTotalRevenueForAdmin = async (req, res) => {
  try {
    // Aggregate total revenue from confirmed bookings
    const result = await bookingModel.aggregate([
      { $match: { status: "Confirmed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;

    res.status(200).json({
      message: "Total revenue fetched successfully.",
      totalRevenue,
    });
  } catch (err) {
    console.error("❌ Failed to fetch total revenue:", err.message);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching revenue." });
  }
};

// 1st
// const checkBookingAvailability = async (req, res) => {
//   try {
//     const { propertyId, checkIn, checkOut } = req.body;

//     const overlapping = await bookingModel.findOne({
//       propertyId,
//       status: { $ne: "Cancelled" },
//       $or: [
//         { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } }
//       ]
//     });

//     if (overlapping) {
//       return res.status(200).json({
//         available: false,
//         message: `Property is already booked from ${new Date(overlapping.checkIn).toLocaleDateString()} to ${new Date(overlapping.checkOut).toLocaleDateString()}.`
//       });
//     }

//     res.status(200).json({ available: true });

//   } catch (err) {
//     console.error("Error checking availability:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const checkBookingAvailability = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;

    const overlapping = await bookingModel.find({
      propertyId,
      status: { $ne: "Cancelled" },
      $or: [
        { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } }
      ]
    });

    const count = overlapping.length;

    const available = count === 0;

    res.status(200).json({
      available,
      overlappingCount: count, // 🔥 send this
      message: !available ? `Property is already booked from ${new Date(overlapping[0].checkIn).toLocaleDateString()} to ${new Date(overlapping[0].checkOut).toLocaleDateString()}.` : null
    });
  } catch (err) {
    console.error("Error checking availability:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addBooking,
  getAllBooking,
  getAllBookingsByUserId,
  getPropertyByBookingId,
  addBookingByPropertyId,
  cancelBooking,
  confirmBooking,
  getBookingsByHostId,
  getHostByPropertyId,
  updateBookingByHost,
  getTotalRevenueForAdmin,
  checkBookingAvailability
};
