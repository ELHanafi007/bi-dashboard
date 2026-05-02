const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getProducts);
router.get('/categories', protect, getCategories);
router.post('/categories', protect, authorize('ADMIN'), createCategory);
router.get('/:id', protect, getProductById);
router.post('/', protect, authorize('ADMIN'), createProduct);
router.put('/:id', protect, authorize('ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
