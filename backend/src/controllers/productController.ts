import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types";

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    let query = 'SELECT * FROM products';
    const values: any[] = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR description ILIKE $1';
      values.push(`%${search}%`);
    }
    
    // Validate sortBy to prevent SQL injection
    const validSortFields = ['name', 'price', 'created_at', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy as string) && validSortOrders.includes(sortOrder as string)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, values);
    
    res.json({
      products: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate input
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    if (isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    // Create product
    const result = await pool.query(
      'INSERT INTO products (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, parseFloat(price), image]
    );

    const product = result.rows[0];

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user?.id, req.user?.email, 'CREATE', 'PRODUCT', product.id, `Created product: ${name}`]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Check if product exists
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      if (isNaN(parseFloat(price))) {
        return res.status(400).json({ error: 'Price must be a valid number' });
      }
      updateFields.push(`price = $${paramCount++}`);
      values.push(parseFloat(price));
    }
    if (image !== undefined) {
      updateFields.push(`image = $${paramCount++}`);
      values.push(image);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    const product = result.rows[0];

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user?.id, req.user?.email, 'UPDATE', 'PRODUCT', product.id, `Updated product: ${product.name}`]
    );

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = existingProduct.rows[0];

    // Delete product
    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user?.id, req.user?.email, 'DELETE', 'PRODUCT', id, `Deleted product: ${product.name}`]
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
