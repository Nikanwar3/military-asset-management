const express = require('express');
const Assignment = require('../models/assignment');
const Asset = require('../models/asset');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create assignment or expenditure (Admin, Base Commander)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Base Commander'), async (req, res) => {
  try {
    const { assetName, assetType, quantity, base, assignedTo, type } = req.body;

    // Check if base has enough quantity
    const asset = await Asset.findOne({ assetName, base });
    if (!asset || asset.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient asset quantity at this base' });
    }

    const assignment = new Assignment({
      assetName,
      assetType,
      quantity,
      base,
      assignedTo,
      type,
      assignedBy: req.user.username
    });
    await assignment.save();

    // Deduct from base inventory
    asset.quantity -= quantity;
    if (type === 'Assignment') {
      asset.status = asset.quantity === 0 ? 'Assigned' : 'Available';
    } else {
      asset.status = asset.quantity === 0 ? 'Expended' : 'Available';
    }
    asset.updatedAt = Date.now();
    await asset.save();

    res.status(201).json({ message: `${type} recorded successfully`, assignment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all assignments/expenditures
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { base, type, assetType } = req.query;
    let filter = {};
    if (base) filter.base = base;
    if (type) filter.type = type;
    if (assetType) filter.assetType = assetType;

    if (req.user.role === 'Base Commander' || req.user.role === 'Logistics Officer') {
      filter.base = req.user.base;
    }

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
