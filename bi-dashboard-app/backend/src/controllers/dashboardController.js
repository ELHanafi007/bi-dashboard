const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  const orgId = req.user.organizationId;
  try {
    const totalRevenue = await prisma.order.aggregate({
      where: { organizationId: orgId },
      _sum: { total: true }
    });

    const totalOrders = await prisma.order.count({ where: { organizationId: orgId } });
    const totalCustomers = await prisma.customer.count({ where: { organizationId: orgId } });
    const totalProducts = await prisma.product.count({ where: { organizationId: orgId } });
    
    const totalDebtResult = await prisma.customer.aggregate({
      where: { organizationId: orgId },
      _sum: { debt: true }
    });
    const totalDebt = totalDebtResult._sum.debt || 0;

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { organizationId: orgId },
      take: 5,
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });

    // Top products (by quantity sold)
    const orderItems = await prisma.orderItem.groupBy({
      where: { organizationId: orgId },
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    const topProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, organizationId: orgId }
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
        totalProducts,
        totalDebt
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
