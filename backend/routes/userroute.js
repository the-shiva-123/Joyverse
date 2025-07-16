import express from "express";
import User from "../models/UserModel.js";
import GameSession from "../models/GameSession.js"; // For game session logging

const router = express.Router();

/**
 * ✅ Get all users with role "user"
 */
router.get('/role/user/all', async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get specific user by username
 */
router.get('/username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get('/therapist/approved', async (req, res) => {
  try {
    const therapists = await User.find({ role: "therapist", isApproved: true });
    res.status(200).json(therapists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch approved therapists" });
  }
});

/**
 * ✅ Delete a user (therapist)
 */
router.delete('/delete/:userId', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get specific user by userId — used for profile detail fetch
 */
router.get('/details/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

/**
 * ✅ Suggest a game to a child
 */
router.post("/suggest-game/:username", async (req, res) => {
  const { gameName } = req.body;
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.suggestedGames.push(gameName);
    await user.save();

    res.status(200).json({ message: "Game suggested successfully" });
  } catch (err) {
    console.error("Error suggesting game:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get children by parent name and contact
 */
router.get('/children/by-parent', async (req, res) => {
  const { parentName, parentContact } = req.query;

  try {
    const children = await User.find({
      parentName,
      parentContact,
      role: "user",
    });

    res.status(200).json(children);
  } catch (err) {
    console.error("Error fetching children:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get pending therapist approval requests
 */ 
router.get("/therapist/requests/pending", async (req, res) => {
  try {
    const therapists = await User.find({ role: "therapist", isApproved: false });
    res.status(200).json(therapists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch" });
  }
});

/**
 * ✅ Approve a therapist
 */
router.post("/therapist/approve/:username", async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { username: req.params.username, role: "therapist" },
      { isApproved: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Therapist not found." });
    }

    res.status(200).json({ message: `${req.params.username} approved.` });
  } catch (error) {
    console.error("Approval failed:", error);
    res.status(500).json({ message: "Approval failed." });
  }
});

/**
 * ✅ Log an emotion entry
 */
router.post("/add-emotion/:username", async (req, res) => {
  const { emotion, gameName } = req.body;

  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.emotions.push({
      emotion,
      gameName,
      date: new Date(),
    });

    await user.save();

    res.status(200).json({ message: "Emotion saved", emotions: user.emotions });
  } catch (err) {
    console.error("Error saving emotion:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Log gameplay
 */
router.post("/add-gameplay/:username", async (req, res) => {
  const { gameName, score = 0, level = 1 } = req.body;

  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.gamePlays.push({
      gameName,
      score,
      level,
      date: new Date(),
    });

    await user.save();

    res.status(200).json({ message: "GamePlay saved", gamePlays: user.gamePlays });
  } catch (err) {
    console.error("Error saving gameplay:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get all game sessions by username (from GameSession model)
 */
router.get("/games/by-username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const sessions = await GameSession.find({ userId: user._id }).sort({ timestamp: 1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching game sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Save a new game session
 */
router.post("/games/add", async (req, res) => {
  const { username, gameName, questions, finalScore } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newSession = new GameSession({
      userId: user._id,
      gameName,
      questions,
      finalScore,
    });

    await newSession.save();

    res.status(201).json({ message: "Game session saved", session: newSession });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
