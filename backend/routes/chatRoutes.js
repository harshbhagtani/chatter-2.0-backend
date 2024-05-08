const { Router } = require("express");
const {
  accessChat,
  createGroupChat,
  fetchAllChats,
  deleteChat
} = require("../controllers/chatControllers");
const auth = require("../middlewares/auth");

const chatRoutes = Router();

chatRoutes.post("/", auth, accessChat);
chatRoutes.post("/create-group", auth, createGroupChat);
chatRoutes.get("/", auth, fetchAllChats);
chatRoutes.delete("/", auth, deleteChat);

module.exports = chatRoutes;
