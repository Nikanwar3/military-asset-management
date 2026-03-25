const express = require('express');
const Asset = require('../models/asset');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all assets (with filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { base, type, status } = req.query;
    let filter = {};
    if (base) filter.base = base;
    if (type) filter.type = type;
    if (status) filter.status = status;

    if (req.user.role === 'Base Commander' || req.user.role === 'Logistics Officer') {
      filter.base = req.user.base;
    }

    const assets = await Asset.find(filter).sort({ updatedAt: -1 });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get dashboard summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'Admin') {
      filter.base = req.user.base;
    }

    const assets = await Asset.find(filter);

    // Summary by base
    const basesSummary = {};
    assets.forEach(asset => {
      if (!basesSummary[asset.base]) {
        basesSummary[asset.base] = { totalAssets: 0, vehicles: 0, weapons: 0, ammunition: 0, equipment: 0 };
      }
      basesSummary[asset.base].totalAssets += asset.quantity;
      switch (asset.type) {
        case 'Vehicle': basesSummary[asset.base].vehicles += asset.quantity; break;
        case 'Weapon': basesSummary[asset.base].weapons += asset.quantity; break;
        case 'Ammunition': basesSummary[asset.base].ammunition += asset.quantity; break;
        case 'Equipment': basesSummary[asset.base].equipment += asset.quantity; break;
      }
    });

    const totalAssets = assets.reduce((sum, a) => sum + a.quantity, 0);
    const totalBases = [...new Set(assets.map(a => a.base))].length;

    res.json({
      totalAssets,
      totalBases,
      basesSummary,
      assets
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
