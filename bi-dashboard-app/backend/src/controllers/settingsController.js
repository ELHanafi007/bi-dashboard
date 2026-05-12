const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get business info
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await prisma.businessInfo.findFirst({
      where: { organizationId: req.user.organizationId }
    });

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.businessInfo.create({
        data: {
          name: 'My Business',
          email: req.user.email,
          organizationId: req.user.organizationId
        }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  const { name, legalForm, address, phone, email, website, logo, taxId, regNumber, managerName } = req.body;

  try {
    let settings = await prisma.businessInfo.findFirst({
      where: { organizationId: req.user.organizationId }
    });

    const data = { 
      name, 
      legalForm, 
      address, 
      phone, 
      email, 
      website, 
      logo, 
      taxId, 
      regNumber, 
      managerName,
      organizationId: req.user.organizationId
    };

    if (settings) {
      settings = await prisma.businessInfo.update({
        where: { id: settings.id },
        data
      });
    } else {
      settings = await prisma.businessInfo.create({
        data
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
