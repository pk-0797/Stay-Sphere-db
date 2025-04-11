const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

router.post("/send", MessageController.sendMessage);

router.get("/:sender/:receiver", MessageController.getMessages);

router.delete("/:id", MessageController.deleteMessage);
router.get("/host/:hostId", MessageController.getMessagesForHost);

router.get("/all", MessageController.getAllMessages);

router.post("/send/host", MessageController.sendMessageFromHost);
router.delete("/delete/:id", MessageController.deleteMessage);
module.exports = router;
