const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

const socketIo = require("socket.io");

//chat routes
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

//env file data config
dotenv.config();

//connect mongo atlas
connectDB();

//add this to convert into json for req,res
app.use(express.json());

/*Add Middleware for routes in express app  */

app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);

app.use(errorMiddleware);

//socket io for live chat

io.on("connection", (socket) => {
  socket.on("setup", (user) => {
    console.log(user._id);
    socket.join(user._id);
    socket.emit("connected");
  });

  socket.on("join room", (data) => {
    socket.join(data._id);
  });

  socket.on("typing", (data) => {
    socket.in(data?._id).emit("typing", data);
  });
  socket.on("not typing", (data) => {
    socket.in(data?._id).emit("stop typing");
    console.log("not");
  });

  socket.on("sendMessage", (data) => {
    data?.chat?.users?.forEach((user) => {
      if (data.sender._id !== user) {
        io.to(user).emit("newMessage", data);
      }
    });
  });
});

server.listen(process.env.PORT, () => {
  console.log("your server is up");
});
