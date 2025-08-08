import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // if (!token) {
  //   return res.status(401).json({ error: 'Access token required' });
  // }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      req.user = user;
      next();
    }
  );
};
