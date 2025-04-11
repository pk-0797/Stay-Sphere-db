const express = require("express");
const { getNotifications, markNotificationAsRead, getUnreadNotificationCount,deleteNotification, deleteMultipleNotifications } = require("../controllers/NotificationController");

const router = express.Router();

router.get("/:userId", getNotifications);
router.put("/mark-read/:notificationId", markNotificationAsRead);
router.get("/count/:userId", getUnreadNotificationCount); 
router.delete("/delete/:notificationId", deleteNotification); 
router.post("/delete-multiple", deleteMultipleNotifications);
module.exports = router;
