const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private
const getSalesAnalytics = async (req, res) => {
  try {
    // Get sales grouped by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day
    const groupedSales = sales.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += order.total;
      acc[date].count += 1;
      return acc;
    }, {});

    res.json(Object.values(groupedSales));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category analytics
// @route   GET /api/analytics/categories
// @access  Private
const getCategoryAnalytics = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            _count: {
              select: { orderItems: true }
            }
          }
        }
      }
    });

    const categoryStats = categories.map((cat) => {
      const totalProducts = cat.products.length;
      const totalSalesCount = cat.products.reduce(
        (acc, prod) => acc + prod._count.orderItems,
        0
      );

      return {
        id: cat.id,
        name: cat.name,
        totalProducts,
        totalSalesCount
      };
    });

    res.json(categoryStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSalesAnalytics, getCategoryAnalytics };
