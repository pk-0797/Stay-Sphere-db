const Notification = require("../models/NotificationModel");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Notifications fetched", data: notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getUnreadNotificationCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ count });
  } catch (err) {
    console.error("Error fetching unread notification count:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of notification IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No notification IDs provided" });
    }

    await Notification.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  deleteNotification,
  deleteMultipleNotifications,
};
