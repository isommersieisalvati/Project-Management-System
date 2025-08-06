import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAuditLogs,
  getAuditLog,
  getUserAuditLogs,
  getAuditStats,
} from "../controllers/auditController";

const router = Router();

// All audit routes require authentication
router.use(authenticateToken);

// Routes
router.get("/", getAuditLogs);
router.get("/stats", getAuditStats);
router.get("/user/:userId", getUserAuditLogs);
router.get("/:id", getAuditLog);

export default router;
