import { Request, Response, NextFunction } from "express";
import { validateRequest } from "../../../src/middleware/validation";
import { mockRequest, mockResponse } from "../../helpers/mockData";

// Mock express-validator
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

const mockValidationResult = require("express-validator").validationResult;

describe("Validation Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("validateRequest", () => {
    it("should call next when no validation errors", () => {
      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      };

      mockValidationResult.mockReturnValueOnce(mockResult as any);

      validateRequest(req as Request, res as Response, next);

      expect(mockResult.isEmpty).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 when validation errors exist", () => {
      const mockErrors = [
        { msg: "Name is required", param: "name" },
        { msg: "Email must be valid", param: "email" },
      ];

      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors),
      };

      mockValidationResult.mockReturnValueOnce(mockResult as any);

      validateRequest(req as Request, res as Response, next);

      expect(mockResult.isEmpty).toHaveBeenCalled();
      expect(mockResult.array).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: mockErrors,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle empty error array", () => {
      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([]),
      };

      mockValidationResult.mockReturnValueOnce(mockResult as any);

      validateRequest(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
