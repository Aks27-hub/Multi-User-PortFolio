import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db.js";

const router = express.Router();

// JWT Secret Key configuration
export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_portfolio_builder_key_2026";

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // 1. Validation
    if (!username || !email || !password) {
      res.status(400).json({ error: "Username, email, and password are required" });
      return;
    }

    if (username.length < 3 || username.length > 50) {
      res.status(400).json({ error: "Username must be between 3 and 50 characters" });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }

    // 2. Check if username or email already exists
    const checkSql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1";
    const [existingUsers] = await query(checkSql, [username, email]);

    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.username.toLowerCase() === username.toLowerCase()) {
        res.status(409).json({ error: "Username is already taken" });
        return;
      }
      res.status(409).json({ error: "Email is already registered" });
      return;
    }

    // 3. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Save User to DB
    const insertUserSql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
    const [result] = await query(insertUserSql, [username, email, passwordHash]);
    const userId = result.insertId;

    // 5. Create default empty profile for the new user
    const insertProfileSql = "INSERT INTO profiles (user_id, full_name, title, bio, avatar_url, github_url, linkedin_url, email_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    await query(insertProfileSql, [
      userId,
      username,
      "New Portfolio Creator",
      "Welcome to my portfolio! Let's write something amazing about myself.",
      null,
      null,
      null,
      email
    ]);

    res.status(201).json({
      message: "User registered successfully!",
      userId,
      username,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "An unexpected error occurred during registration" });
  }
}

/**
 * Log in an existing user and return a JWT
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;

    // 1. Validation
    if (!usernameOrEmail || !password) {
      res.status(400).json({ error: "Username or email, and password are required" });
      return;
    }

    // 2. Fetch User from Database
    const fetchUserSql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1";
    const [users] = await query(fetchUserSql, [usernameOrEmail, usernameOrEmail]);

    if (!users || users.length === 0) {
      res.status(401).json({ error: "Invalid username, email, or password" });
      return;
    }

    const user = users[0];

    // 3. Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid username, email, or password" });
      return;
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 5. Respond with Token and User Details
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "An unexpected error occurred during login" });
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token is missing" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired access token" });
      return;
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
    };
    next();
  });
}

router.post("/register", register);
router.post("/login", login);

export default router;
