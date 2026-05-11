const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

const buildAuthResponse = (user, token) => ({
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  },
  token,
});

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    return res.status(500).json({ message: "Registration failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

const logout = async (_req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully." });
};

module.exports = { register, login, getMe, logout };
