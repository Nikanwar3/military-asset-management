const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  assetType: {
    type: String,
    enum: ['Vehicle', 'Weapon', 'Ammunition', 'Equipment'],
    required: true
  },
  quantity: { type: Number, required: true },
  base: { type: String, required: true },
  purchasedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
