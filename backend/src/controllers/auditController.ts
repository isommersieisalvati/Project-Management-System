import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types";

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entityType,
      dateFrom,
      dateTo,
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userId) {
      conditions.push(`user_id = $${paramCount++}`);
      values.push(userId);
    }

    if (action) {
      conditions.push(`action = $${paramCount++}`);
      values.push(action);
    }

    if (entityType) {
      conditions.push(`entity_type = $${paramCount++}`);
      values.push(entityType);
    }

    if (dateFrom) {
      conditions.push(`created_at >= $${paramCount++}`);
      values.push(dateFrom);
    }

    if (dateTo) {
      conditions.push(`created_at <= $${paramCount++}`);
      values.push(dateTo);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const dataQuery = `
      SELECT 
        id,
        user_id,
        user_email,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      FROM audit_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;

    values.push(limitNum, offset);
    const dataResult = await pool.query(dataQuery, values);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      auditLogs: dataResult.rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM audit_logs WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Audit log not found" });
    }

    res.json({ auditLog: result.rows[0] });
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    // Get total count for user
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM audit_logs WHERE user_id = $1",
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results for user
    const dataResult = await pool.query(
      `SELECT 
        id,
        user_id,
        user_email,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      FROM audit_logs 
      WHERE user_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [userId, limitNum, offset]
    );

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      auditLogs: dataResult.rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get user audit logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAuditStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get action statistics
    const actionStatsResult = await pool.query(`
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs
      GROUP BY action
      ORDER BY count DESC
    `);

    // Get entity type statistics
    const entityStatsResult = await pool.query(`
      SELECT 
        entity_type,
        COUNT(*) as count
      FROM audit_logs
      GROUP BY entity_type
      ORDER BY count DESC
    `);

    // Get daily activity for the last 30 days
    const dailyActivityResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get total audit logs count
    const totalCountResult = await pool.query(
      "SELECT COUNT(*) FROM audit_logs"
    );

    res.json({
      actionStats: actionStatsResult.rows,
      entityStats: entityStatsResult.rows,
      dailyActivity: dailyActivityResult.rows,
      totalLogs: parseInt(totalCountResult.rows[0].count),
    });
  } catch (error) {
    console.error("Get audit stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
