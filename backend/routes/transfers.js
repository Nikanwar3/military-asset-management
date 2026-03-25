const express = require('express');
const Transfer = require('../models/transfer');
const Asset = require('../models/asset');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Initiate a transfer (Admin, Logistics Officer)
router.post('/', authenticateToken, authorizeRoles('Admin', 'Logistics Officer'), async (req, res) => {
  try {
    const { assetName, assetType, quantity, fromBase, toBase } = req.body;

    // Check if source base has enough quantity
    const sourceAsset = await Asset.findOne({ assetName, base: fromBase });
    if (!sourceAsset || sourceAsset.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient asset quantity at source base' });
    }

    const transfer = new Transfer({
      assetName,
      assetType,
      quantity,
      fromBase,
      toBase,
      initiatedBy: req.user.username
    });
    await transfer.save();

    // Deduct from source
    sourceAsset.quantity -= quantity;
    sourceAsset.updatedAt = Date.now();
    await sourceAsset.save();

    res.status(201).json({ message: 'Transfer initiated successfully', transfer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Complete a transfer (Admin, Logistics Officer)
router.put('/:id/complete', authenticateToken, authorizeRoles('Admin', 'Logistics Officer'), async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    if (transfer.status === 'Completed') {
      return res.status(400).json({ message: 'Transfer already completed' });
    }

    transfer.status = 'Completed';
    transfer.completedAt = Date.now();
    await transfer.save();

    // Add to destination base
    let destAsset = await Asset.findOne({ assetName: transfer.assetName, base: transfer.toBase });
    if (destAsset) {
      destAsset.quantity += transfer.quantity;
      destAsset.updatedAt = Date.now();
      await destAsset.save();
    } else {
      destAsset = new Asset({
        assetName: transfer.assetName,
        type: transfer.assetType,
        quantity: transfer.quantity,
        base: transfer.toBase,
        status: 'Available'
      });
      await destAsset.save();
    }

    res.json({ message: 'Transfer completed successfully', transfer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all transfers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { fromBase, toBase, status } = req.query;
    let filter = {};
    if (fromBase) filter.fromBase = fromBase;
    if (toBase) filter.toBase = toBase;
    if (status) filter.status = status;

    if (req.user.role === 'Base Commander' || req.user.role === 'Logistics Officer') {
      filter.$or = [{ fromBase: req.user.base }, { toBase: req.user.base }];
    }

    const transfers = await Transfer.find(filter).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
