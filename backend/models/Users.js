const { hash, compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const validator = require("validator");
const ErrorHandler = require("../utils/errorHandler");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new ErrorHandler("Email provided is not valid", 400);
        }
      }
    },
    password: { type: String, required: true },
    userpic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    tokens: [
      {
        token: {
          type: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.methods.generateToken = async function () {
  const user = this;
  const token = sign({ _id: user?._id.toString() }, process.env.JWT_SIGNATURE);

  user.tokens.push({ token });
  await user.save();

  return token;
};

userSchema.statics.getuserByEmailPassword = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("User does not exist", 404);
  }

  const isMatch = await compare(password, user.password);

  if (!isMatch) {
    throw new ErrorHandler("Password incorrect", 400);
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const hashedPassword = await hash(user.password, 8);
    user.password = hashedPassword;
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
