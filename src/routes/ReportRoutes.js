const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/ReportController");

router.post("/send/admin", ReportController.sendMessageToAdmin);
router.get("/user/:userId", ReportController.getMessagesForUser);
router.delete("/delete/:id", ReportController.deleteReport);
router.get("/unread-count", ReportController.getUnreadReportCount);

router.get("/admin/userreports", ReportController.getAllMessagesWithUser);
module.exports = router;
