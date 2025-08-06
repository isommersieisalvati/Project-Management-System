import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import { LoginRequest, RegisterRequest } from "../types";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role = "user",
    }: RegisterRequest & { role?: string } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      "INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at",
      [email, hashedPassword, firstName, lastName, role]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    // Log the registration
    await pool.query(
      "INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        user.id,
        user.email,
        "REGISTER",
        "USER",
        user.id,
        "User registered successfully",
      ]
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const result = await pool.query(
      "SELECT id, email, password, first_name, last_name, role, created_at FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    // Log the login
    await pool.query(
      "INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        user.id,
        user.email,
        "LOGIN",
        "USER",
        user.id,
        "User logged in successfully",
      ]
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
