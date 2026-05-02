const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { totalSpending: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: {
          include: {
            items: {
              include: { product: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const customerExists = await prisma.customer.findUnique({
      where: { email }
    });

    if (customerExists) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const customer = await prisma.customer.create({
      data: { name, email, phone }
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, email, phone }
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer
};
