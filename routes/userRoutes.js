const { Router } = require("express");
const {
  userSignUp,
  userSignIn,
  fetchMyProfile,
  fetchUsers
} = require("../controllers/userControllers");
const auth = require("../middlewares/auth");

const userRoutes = Router();

userRoutes.post("/signup", userSignUp);
userRoutes.post("/login", userSignIn);
userRoutes.get("/me", auth, fetchMyProfile);
userRoutes.get("/", auth, fetchUsers);

module.exports = userRoutes;
