const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  type: {
    type: String,
    enum: ['Vehicle', 'Weapon', 'Ammunition', 'Equipment'],
    required: true
  },
  quantity: { type: Number, required: true, default: 0 },
  base: { type: String, required: true },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'In Transit', 'Expended'],
    default: 'Available'
  },
  assignedTo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', assetSchema);
