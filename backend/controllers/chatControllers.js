const catchAsync = require("../middlewares/catchAsync");
const Chat = require("../models/ChatModel");
const Message = require("../models/Message");
const User = require("../models/Users");
const ErrorHandler = require("../utils");

const accessChat = catchAsync(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ErrorHandler("No userid provided", 400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email"
  });

  if (isChat.length > 0) {
    return res.status(200).send(isChat);
  } else {
    const { userId } = req.body;

    const payload = {
      users: [userId, req.user._id],
      isGroupChat: false
    };

    const createdChat = await Chat.create(payload);

    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );

    res.status(200).send([FullChat]);
  }
});

const createGroupChat = catchAsync(async (req, res) => {
  if (!req.body.name || !req.body.userIds) {
    throw new ErrorHandler("Please fill all the fields");
  }

  const { userIds, name } = req.body;

  if (userIds.length < 1) {
    throw new ErrorHandler("Add atleast one member to the group");
  }

  userIds.push(req.user._id);

  const payload = {
    chatName: name,
    isGroupChat: true,
    users: userIds,
    groupAdmin: req.user._id
  };

  const groupChat = await Chat.create(payload);

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password -tokens")
    .populate("groupAdmin", "-password -tokens");

  res.status(201).send(fullGroupChat);
});

const fetchAllChats = catchAsync(async (req, res) => {
  const chatList = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } }
  })
    .populate("users", "-password -tokens")
    .populate("groupAdmin", "-password -tokens")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (result) => {
      result = await User.populate(result, {
        path: "latestMessage.sender",
        select: "name email"
      });

      return result;
    });

  res.status(200).send(chatList);
});

const deleteChat = catchAsync(async (req, res) => {
  if (!req.body.chatId) throw new ErrorHandler("Please provide a valid chatId");
  const { chatId } = req.body;

  const chat = await Chat.findOneAndDelete({ _id: chatId });

  res.status(200).send({ message: "Chat successfully deleted" });
});

module.exports = { accessChat, createGroupChat, fetchAllChats, deleteChat };
