const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsync = require("./catchAsync");

const auth = catchAsync(async (req, res, next) => {
  if (!req.header("Authorization")) {
    throw new ErrorHandler("No token provided", 401);
  }

  const token = req.header("Authorization").split(" ")[1];

  const isValid = jwt.verify(token, process.env.JWT_SIGNATURE);

  const user = await User.findById({ _id: isValid?._id })
    .select("-password")
    .select("-tokens");

  if (!user) {
    throw new Error({ status: 401, message: "Please Login again!!" });
  }

  req.user = user;

  next();
});

module.exports = auth;



