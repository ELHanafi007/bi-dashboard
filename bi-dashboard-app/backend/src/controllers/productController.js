const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { organizationId: req.user.organizationId },
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { 
        id: req.params.id,
        organizationId: req.user.organizationId 
      },
      include: { category: true }
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        organizationId: req.user.organizationId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;

  try {
    // Check ownership first
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        categoryId
      }
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!existing) return res.status(404).json({ message: 'Product not found' });

    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { organizationId: req.user.organizationId }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({
      data: { 
        name,
        organizationId: req.user.organizationId
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
};
