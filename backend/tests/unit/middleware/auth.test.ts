import { Request, Response, NextFunction } from "express";
import { authenticateToken } from "../../../src/middleware/auth";
import { AuthRequest } from "../../../src/types";
import { mockRequest, mockResponse } from "../../helpers/mockData";
import jwt from "jsonwebtoken";

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("Auth Middleware", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("authenticateToken", () => {
    it("should authenticate valid token successfully", () => {
      const mockUser = { id: 1, email: "test@example.com" };
      req.headers = { authorization: "Bearer valid-token" };

      (mockJwt.verify as jest.Mock).mockImplementationOnce(
        (token, secret, callback) => {
          callback(null, mockUser);
        }
      );

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        "valid-token",
        "test-secret",
        expect.any(Function)
      );
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it("should return 401 when no token provided", () => {
      req.headers = {};

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Access token required" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token format is invalid", () => {
      req.headers = { authorization: "invalid-format" };

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Access token required" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token is invalid", () => {
      req.headers = { authorization: "Bearer invalid-token" };

      (mockJwt.verify as jest.Mock).mockImplementationOnce(
        (token, secret, callback) => {
          callback(new Error("Invalid token"), null);
        }
      );

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle expired token", () => {
      req.headers = { authorization: "Bearer expired-token" };

      const tokenError = new Error("Token expired");
      tokenError.name = "TokenExpiredError";
      (mockJwt.verify as jest.Mock).mockImplementationOnce(
        (token, secret, callback) => {
          callback(tokenError, null);
        }
      );

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
