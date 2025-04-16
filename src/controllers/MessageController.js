const Message = require("../models/MessageModel");
const io = global.io; // Ensure Socket.io is available globally

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, hostId, name, email, message } = req.body;

    if (!bookingId || !hostId || !name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Message({
      bookingId,
      hostId,
      name,
      email,
      message,
      createdAt: new Date(),
    });

    await newMessage.save();

    // Emit new message event to all connected clients
    io.emit("newMessage", newMessage);

    res
      .status(201)
      .json({ message: "Message sent successfully!", data: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
exports.getAllMessages = async (req, res) => {
  // try {
  //   // ✅ Fetch ALL messages from the database, sorted by newest first
  //   const messages = await Message.find().sort({ createdAt: -1 });

  //   if (!messages || messages.length === 0) {
  //     return res.status(200).json({ data: [] }); // ✅ Always return an array
  //   }

  //   res.status(200).json({ data: messages });
  // } catch (error) {
  //   console.error("Error fetching all messages:", error);
  //   res.status(500).json({ message: "Internal server error", error });
  // }
  const hostId = req.query.hostId;

    try {
        let messages;
        if (hostId) {
            messages = await Message.find({ hostId });
        } else {
            // Admin can see all messages (no filter applied)
            messages = await Message.find();
        }
        res.json({ data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

exports.getMessagesForHost = async (req, res) => {
  try {
    const { hostId } = req.params;

    if (!hostId) {
      return res.status(400).json({ message: "Host ID is required." });
    }

    // ✅ Fetch all messages for this host, sorted by newest first
    const messages = await Message.find({ hostId }).sort({ createdAt: -1 });

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages for host:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.sendMessageFromHost = async (req, res) => {
  try {
    const { bookingId, hostId, userId, name, email, message } = req.body;

    if (!bookingId || !hostId || !userId || !name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newMessage = new Message({
      bookingId,
      hostId,
      userId, // ✅ Store the user ID so we know which user the host is messaging
      name,
      email,
      message,
      senderType: "host", // ✅ Mark this message as sent by the host
    });

    await newMessage.save();

    // Emit new message event to all connected clients
    io.emit("newMessage", newMessage);

    res
      .status(201)
      .json({ message: "Message sent successfully!", data: newMessage });
  } catch (error) {
    console.error("Error in sendMessageFromHost:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
