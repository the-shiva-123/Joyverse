// Controllers/authcontrol.js
import bcrypt from "bcryptjs"; //password hashing and comparison
import jwt from "jsonwebtoken"; //generate secure tokens for login sessions 
import User from "../models/UserModel.js";

export const signup = async (req, res) => {
  try {
    const {
      username,
      password,
      email = "",
      parentName = "",
      parentContact = "",
      childAge = null,
      role,
    } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      parentName,
      parentContact,
      childAge,
      role,
      isApproved: role === "therapist" ? false : true,
    });

    await newUser.save();

    if (role === "therapist") {
      return res
        .status(201)
        .json({ message: "Therapist registered. Awaiting admin approval." });
    }

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "therapist" && !user.isApproved) {
      return res
        .status(403)
        .json({ message: "Your account is awaiting admin approval." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
