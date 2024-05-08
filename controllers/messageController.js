const { default: mongoose } = require("mongoose");
const catchAsync = require("../middlewares/catchAsync");
const Chat = require("../models/ChatModel");
const Message = require("../models/Message");
const User = require("../models/Users");
const ErrorHandler = require("../utils/ErrorHandler");
const grid = require("gridfs-stream");

const BASE_URL = "http://localhost:3002";

const fetchMessages = catchAsync(async (req, res) => {
  if (!req.query.chatId) {
    throw new ErrorHandler("Provide valid chatId", 400);
  } else if (!mongoose.Types.ObjectId.isValid(req.query.chatId)) {
    throw new ErrorHandler("Invalid chatId format", 400);
  }

  const messageList = await Message.find({ chat: req.query.chatId })
    .populate("sender", "-password -tokens")
    .populate("chat");

  res.status(200).send(messageList);
});

const sendMessage = catchAsync(async (req, res) => {
  if (!req.body.message) {
    throw new ErrorHandler("Empty message not allowed", 400);
  }
  if (!req.body.chatId) {
    throw new ErrorHandler("chatId Not Provided", 400);
  }

  const messageBody = {
    sender: req.user._id,
    content: req.body.message,
    chat: req.body.chatId
  };

  const message = await Message.create(messageBody);

  let fetchMessageFullData = await message.populate("sender", "name email");
  fetchMessageFullData = await fetchMessageFullData.populate("chat");
  await Chat.findByIdAndUpdate(
    { _id: req.body.chatId },
    { latestMessage: fetchMessageFullData }
  );

  res.status(201).send(fetchMessageFullData);
});

const uploadFile = catchAsync(async (req, res) => {
  const payload = {
    chat: req.body.chatId,
    isAttachMent: req.file.mimetype,
    sender: req.user._id,
    content: `${BASE_URL}/api/messages/file/${req.file.filename}`
  };

  let message = await Message.create(payload);
  message = await message.populate("sender", "name userpic email");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name userpic email"
  });

  res.status(200).send(message);
});

let gfs, gridfsBucket;
const conn = mongoose.connection;
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "fs"
  });
  gfs = grid(conn.db, mongoose.mongo);
  gfs.collection("fs");
});

const getFile = async (request, response) => {
  console.log(request, "sa");
  try {
    const file = await gfs.files.findOne({ filename: request.params.fileName });
    // const readStream = gfs.createReadStream(file.filename);
    // readStream.pipe(response);

    const readStream = gridfsBucket.openDownloadStream(file._id);
    readStream.pipe(response);
  } catch (error) {
    response.status(500).json({ msg: error.message });
  }
};

module.exports = {
  sendMessage,
  fetchMessages,
  uploadFile,
  getFile
};
