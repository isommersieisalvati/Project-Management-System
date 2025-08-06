import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController";

const router = Router();

// All product routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
