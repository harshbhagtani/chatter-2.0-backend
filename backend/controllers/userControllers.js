const catchAsync = require("../middlewares/catchAsync");
const User = require("../models/Users");
const ErrorHandler = require("../utils/ErrorHandler");

const userSignUp = catchAsync(async (req, res) => {
  const payload = { ...req.body };

  const newuser = new User(payload);
  await newuser.save();
  const token = await newuser.generateToken();

  res.status(201).send({ token });
});

const userSignIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.getuserByEmailPassword(email, password);

  const token = await user.generateToken();

  res.status(201).send({ token });
});

const fetchMyProfile = catchAsync(async (req, res) => {
  const user = req.user;

  res.status(200).send(user);
});

const fetchUsers = catchAsync(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : {};

  let userList = await User.find(keyword);
  userList = userList.filter((user) => req.user._id !== user._id);

  res.status(200).send({ users: userList });
});

module.exports = {
  userSignIn,
  userSignUp,
  fetchMyProfile,
  fetchUsers
};
