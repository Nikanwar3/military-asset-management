const express = require('express');
const Purchase = require('../models/purchase');
const Asset = require('../models/asset');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Record a new purchase (Admin, Logistics Officer)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Logistics Officer'), async (req, res) => {
  try {
    const { assetName, assetType, quantity, base } = req.body;

    const purchase = new Purchase({
      assetName,
      assetType,
      quantity,
      base,
      purchasedBy: req.user.username
    });
    await purchase.save();

    // Update or create asset in inventory
    let asset = await Asset.findOne({ assetName, base });
    if (asset) {
      asset.quantity += quantity;
      asset.updatedAt = Date.now();
      await asset.save();
    } else {
      asset = new Asset({ assetName, type: assetType, quantity, base, status: 'Available' });
      await asset.save();
    }

    res.status(201).json({ message: 'Purchase recorded successfully', purchase });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all purchases
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { base, assetType } = req.query;
    let filter = {};
    if (base) filter.base = base;
    if (assetType) filter.assetType = assetType;

    // Non-admin users can only see their base's purchases
    if (req.user.role === 'Base Commander' || req.user.role === 'Logistics Officer') {
      filter.base = req.user.base;
    }

    const purchases = await Purchase.find(filter).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
