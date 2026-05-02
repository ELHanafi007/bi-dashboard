const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true }
    });

    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });

    // Top products (by quantity sold)
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    const topProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        return {
          ...product,
          soldCount: item._sum.quantity
        };
      })
    );

    res.json({
      summary: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalCustomers,
        totalProducts
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
