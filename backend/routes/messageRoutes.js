const { Router } = require("express");
const auth = require("../middlewares/auth");
const {
  sendMessage,
  fetchMessages,
  uploadFile,
  getFile
} = require("../controllers/messageController");
const { upload } = require("../middlewares/uploadMiddleware");

const messageRoutes = Router();

messageRoutes.post("/send", auth, sendMessage);
messageRoutes.post("/uploadfile", auth, upload.single("file"), uploadFile);
messageRoutes.get("/", auth, fetchMessages);
messageRoutes.get("/file/:fileName", getFile);

module.exports = messageRoutes;
