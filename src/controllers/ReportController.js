const Message = require("../models/ReportModel");
const io = global.io;
const Notification = require("../models/NotificationModel");

exports.sendMessageToAdmin = async (req, res) => {
  try {
    const { senderId, receiverId, senderType, message } = req.body;

    if (!senderId || !receiverId || !senderType || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      senderType,
      message,
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.getMessagesForAdmin = async (req, res) => {
  try {
    const adminId = "67e9fcaa8609191405ae3b81"; // Replace with dynamic admin if needed

    const messages = await Message.find({ receiverId: adminId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMessagesWithUser = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("senderId", "fullName email role") // only needed fields
      .sort({ createdAt: -1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete report", error });
  }
};

exports.getUnreadReportCount = async (req, res) => {
  try {
    const adminId = "67e9fcaa8609191405ae3b81"; // or get dynamically if needed
    const count = await Message.countDocuments({ receiverId: adminId, isSeen: false });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unread report count", error });
  }
};

