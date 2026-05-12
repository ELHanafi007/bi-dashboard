const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { organizationId: req.user.organizationId },
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

const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { 
        id: req.params.id,
        organizationId: req.user.organizationId
      },
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

const createCustomer = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const customerExists = await prisma.customer.findFirst({
      where: { 
        email,
        organizationId: req.user.organizationId
      }
    });

    if (customerExists) {
      return res.status(400).json({ message: 'Customer with this email already exists in your organization' });
    }

    const customer = await prisma.customer.create({
      data: { 
        name, 
        email, 
        phone,
        organizationId: req.user.organizationId
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, email, phone }
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordPayment = async (req, res) => {
  const { amount } = req.body;
  const parsedAmount = parseFloat(amount);

  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  try {
    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    const updatedCustomer = await prisma.$transaction(async (tx) => {
      // Create payment record
      await tx.payment.create({
        data: {
          amount: parsedAmount,
          customerId: existing.id,
          organizationId: req.user.organizationId
        }
      });

      // Reduce debt
      return await tx.customer.update({
        where: { id: existing.id },
        data: {
          debt: {
            decrement: parsedAmount
          }
        }
      });
    });

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  recordPayment
};
