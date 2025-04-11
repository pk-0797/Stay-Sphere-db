const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setUserId", (userId) => {
    socket.userId = userId; // Attach user ID to socket
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId || "unknown"} disconnected`);
  });
});

global.io = io;

const roleRoutes = require("./src/routes/RoleRoutes");
app.use(roleRoutes);

const userRoutes = require("./src/routes/UserRoutes");
app.use(userRoutes);

const stateRoutes = require("./src/routes/StateRoutes");
app.use("/state", stateRoutes);

const cityRoutes = require("./src/routes/CityRoutes");
app.use("/city", cityRoutes);

const areaRoutes = require("./src/routes/AreaRoutes");
app.use("/area", areaRoutes);

const propertyRoutes = require("./src/routes/PropertyRoutes");
app.use("/property", propertyRoutes);

const bookingRoutes = require("./src/routes/BookingRoutes");
app.use("/booking", bookingRoutes);

const reviewRoutes = require("./src/routes/ReviewRoutes");
app.use("/review", reviewRoutes);

const messageRoutes = require("./src/routes/MessageRoutes");
app.use("/messages", messageRoutes);

const reportRoutes = require("./src/routes/ReportRoutes");
app.use("/report", reportRoutes);

const notificationsRoutes = require("./src/routes/NotificationRoutes");
app.use("/notifications", notificationsRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/Stay_Sphere_database_Copy")
  .then(() => {
    console.log("Database connected successfully!!");
  });

const PORT = 3002;
server.listen(PORT, () => {
  console.log("Server started on port number", PORT);
});
