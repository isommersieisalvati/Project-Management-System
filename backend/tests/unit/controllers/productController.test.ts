import { Request, Response } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../src/controllers/productController";
import { AuthRequest } from "../../../src/types";
import {
  mockProducts,
  mockProduct,
  mockRequest,
  mockResponse,
  mockAdminUser,
} from "../../helpers/mockData";

// Mock the database module before importing
jest.mock("../../../src/config/database", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

// Import the mocked module
import pool from "../../../src/config/database";
const mockQuery = (pool as any).query;

describe("Product Controller", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    mockQuery.mockClear();
  });

  describe("getProducts", () => {
    it("should return all products with default sorting", async () => {
      const mockQueryResult = { rows: mockProducts };
      mockQuery.mockResolvedValueOnce(mockQueryResult);

      req.query = {};

      await getProducts(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM products ORDER BY created_at desc",
        []
      );
      expect(res.json).toHaveBeenCalledWith({
        products: mockProducts,
        total: mockProducts.length,
      });
    });

    it("should filter products by search term", async () => {
      const mockQueryResult = { rows: [mockProduct] };
      mockQuery.mockResolvedValueOnce(mockQueryResult);

      req.query = { search: "Test" };

      await getProducts(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY created_at desc",
        ["%Test%"]
      );
      expect(res.json).toHaveBeenCalledWith({
        products: [mockProduct],
        total: 1,
      });
    });

    it("should sort products by valid field and order", async () => {
      const mockQueryResult = { rows: mockProducts };
      mockQuery.mockResolvedValueOnce(mockQueryResult);

      req.query = { sortBy: "name", sortOrder: "asc" };

      await getProducts(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM products ORDER BY name asc",
        []
      );
    });

    it("should use default sorting for invalid sort parameters", async () => {
      const mockQueryResult = { rows: mockProducts };
      mockQuery.mockResolvedValueOnce(mockQueryResult);

      req.query = { sortBy: "invalid_field", sortOrder: "invalid_order" };

      await getProducts(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM products ORDER BY created_at DESC",
        []
      );
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      await getProducts(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getProduct", () => {
    it("should return a single product by id", async () => {
      const mockQueryResult = { rows: [mockProduct] };
      mockQuery.mockResolvedValueOnce(mockQueryResult);

      req.params = { id: "1" };

      await getProduct(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM products WHERE id = $1",
        ["1"]
      );
      expect(res.json).toHaveBeenCalledWith({ product: mockProduct });
    });

    it("should return 404 when product not found", async () => {
      const mockQueryResult = { rows: [] };
      mockQuery.mockResolvedValueOnce(mockQueryResult);

      req.params = { id: "999" };

      await getProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      req.params = { id: "1" };

      await getProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("createProduct", () => {
    it("should create a new product successfully", async () => {
      const mockCreateResult = { rows: [mockProduct] };
      const mockAuditResult = { rows: [] };

      mockQuery
        .mockResolvedValueOnce(mockCreateResult) // Product creation
        .mockResolvedValueOnce(mockAuditResult); // Audit log

      req.body = {
        name: "Test Product",
        description: "Test description",
        price: "19.99",
      };
      req.user = mockAdminUser;

      await createProduct(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product created successfully",
        product: mockProduct,
      });
    });

    it("should return 400 for missing required fields", async () => {
      req.body = { description: "Missing name and price" };

      await createProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Name and price are required",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid price", async () => {
      req.body = {
        name: "Test Product",
        price: "invalid-price",
      };

      await createProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Price must be a valid number",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("should handle file upload", async () => {
      const mockCreateResult = {
        rows: [{ ...mockProduct, image_url: "/uploads/test.jpg" }],
      };
      const mockAuditResult = { rows: [] };

      mockQuery
        .mockResolvedValueOnce(mockCreateResult)
        .mockResolvedValueOnce(mockAuditResult);

      req.body = {
        name: "Test Product",
        description: "Test description",
        price: "19.99",
      };
      req.file = { filename: "test.jpg" } as any;
      req.user = mockAdminUser;

      await createProduct(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO products"),
        [
          "Test Product",
          "Test description",
          19.99,
          "/uploads/test.jpg",
          mockAdminUser.id,
        ]
      );
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      req.body = {
        name: "Test Product",
        price: "19.99",
      };
      req.user = mockAdminUser;

      await createProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("updateProduct", () => {
    it("should update a product successfully", async () => {
      const mockExistingResult = { rows: [mockProduct] };
      const mockUpdateResult = {
        rows: [{ ...mockProduct, name: "Updated Product" }],
      };
      const mockAuditResult = { rows: [] };

      mockQuery
        .mockResolvedValueOnce(mockExistingResult) // Check if exists
        .mockResolvedValueOnce(mockUpdateResult) // Update product
        .mockResolvedValueOnce(mockAuditResult); // Audit log

      req.params = { id: "1" };
      req.body = { name: "Updated Product" };
      req.user = mockAdminUser;

      await updateProduct(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product updated successfully",
        product: { ...mockProduct, name: "Updated Product" },
      });
    });

    it("should return 404 when product not found", async () => {
      const mockExistingResult = { rows: [] };
      mockQuery.mockResolvedValueOnce(mockExistingResult);

      req.params = { id: "999" };
      req.body = { name: "Updated Product" };

      await updateProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("should return 400 for invalid price", async () => {
      const mockExistingResult = { rows: [mockProduct] };
      mockQuery.mockResolvedValueOnce(mockExistingResult);

      req.params = { id: "1" };
      req.body = { price: "invalid-price" };

      await updateProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Price must be a valid number",
      });
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product successfully", async () => {
      const mockExistingResult = { rows: [mockProduct] };
      const mockDeleteResult = { rows: [] };
      const mockAuditResult = { rows: [] };

      mockQuery
        .mockResolvedValueOnce(mockExistingResult) // Check if exists
        .mockResolvedValueOnce(mockDeleteResult) // Delete product
        .mockResolvedValueOnce(mockAuditResult); // Audit log

      req.params = { id: "1" };
      req.user = mockAdminUser;

      await deleteProduct(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product deleted successfully",
      });
    });

    it("should return 404 when product not found", async () => {
      const mockExistingResult = { rows: [] };
      mockQuery.mockResolvedValueOnce(mockExistingResult);

      req.params = { id: "999" };

      await deleteProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"));

      req.params = { id: "1" };
      req.user = mockAdminUser;

      await deleteProduct(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
