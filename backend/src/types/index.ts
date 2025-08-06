import { Request } from "express";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: number;
  userId: number;
  userEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "REGISTER";
  entityType: "USER" | "PRODUCT";
  entityId?: number;
  details?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "user";
}
