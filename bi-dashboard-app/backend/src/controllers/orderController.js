const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { 
        id: req.params.id,
        organizationId: req.user.organizationId
      },
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  const { customerId, items, total, paidAmount, paymentStatus } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const parsedTotal = parseFloat(total);
  const parsedPaid = paidAmount !== undefined ? parseFloat(paidAmount) : parsedTotal;
  const statusToSave = paymentStatus || (parsedPaid >= parsedTotal ? 'PAID' : (parsedPaid > 0 ? 'PARTIAL' : 'UNPAID'));
  const debtIncrease = parsedTotal - parsedPaid;

  try {
    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Verification: Ensure customer belongs to org
      const customer = await tx.customer.findFirst({
        where: { id: customerId, organizationId: req.user.organizationId }
      });
      if (!customer) throw new Error('Customer not found in your organization');

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId,
          total: parsedTotal,
          paidAmount: parsedPaid,
          paymentStatus: statusToSave,
          organizationId: req.user.organizationId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price),
              organizationId: req.user.organizationId
            }))
          }
        },
        include: { items: true }
      });

      // Update customer total spending and debt
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalSpending: {
            increment: parsedTotal
          },
          debt: {
            increment: debtIncrease > 0 ? debtIncrease : 0
          }
        }
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: parseInt(item.quantity)
            }
          }
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const existing = await prisma.order.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId }
    });

    if (!existing) return res.status(404).json({ message: 'Order not found' });

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
