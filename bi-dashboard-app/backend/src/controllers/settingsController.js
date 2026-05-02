const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get business info
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await prisma.businessInfo.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.businessInfo.create({
        data: {
          name: 'My Business',
          email: 'admin@example.com'
        }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update business info
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  const { name, address, phone, email, logo } = req.body;

  try {
    let settings = await prisma.businessInfo.findFirst();

    if (settings) {
      settings = await prisma.businessInfo.update({
        where: { id: settings.id },
        data: { name, address, phone, email, logo }
      });
    } else {
      settings = await prisma.businessInfo.create({
        data: { name, address, phone, email, logo }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
