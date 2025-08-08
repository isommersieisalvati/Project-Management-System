import { Request, Response } from "express";
import { register, login } from "../../../src/controllers/authController";
import { AuthRequest } from "../../../src/types";
import {
  mockRequest,
  mockResponse,
  mockAdminUser,
} from "../../helpers/mockData";

// Mock the database module
jest.mock("../../../src/config/database", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock("bcryptjs");

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

// Import the mocked modules
import pool from "../../../src/config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const mockQuery = (pool as any).query;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("Auth Controller", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    mockQuery.mockClear();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockHashedPassword = "hashedPassword123";
      const mockUserId = 1;
      const mockToken = "jwt-token";

      (mockBcrypt.hash as jest.Mock).mockResolvedValueOnce(mockHashedPassword);
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // Check if user exists
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockUserId,
              email: "test@example.com",
              first_name: "Test",
              last_name: "User",
              role: "user",
              created_at: new Date(),
            },
          ],
        }) // Insert user
        .mockResolvedValueOnce({ rows: [] }); // Audit log
      (mockJwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      req.body = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "user",
      };

      await register(req as Request, res as Response);

      expect(mockBcrypt.hash).toHaveBeenCalledWith("password123", 12);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT id FROM users WHERE email = $1",
        ["test@example.com"]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User registered successfully",
          token: mockToken,
        })
      );
    });

    it("should return 400 if user already exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // User exists

      req.body = {
        email: "existing@example.com",
        password: "password123",
        firstName: "Existing",
        lastName: "User",
      };

      await register(req as Request, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT id FROM users WHERE email = $1",
        ["existing@example.com"]
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User already exists with this email",
      });
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      req.body = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        first_name: "Test",
        last_name: "User",
        role: "user",
        created_at: new Date(),
      };
      const mockToken = "jwt-token";

      mockQuery
        .mockResolvedValueOnce({ rows: [mockUser] }) // Find user
        .mockResolvedValueOnce({ rows: [] }); // Audit log
      (mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (mockJwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      await login(req as Request, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT id, email, password, first_name, last_name, role, created_at FROM users WHERE email = $1",
        ["test@example.com"]
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: mockToken,
        })
      );
    });

    it("should return 401 for user not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found

      req.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });

    it("should return 401 for incorrect password", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        first_name: "Test",
        last_name: "User",
        role: "user",
        created_at: new Date(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });
      (mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // Wrong password

      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
