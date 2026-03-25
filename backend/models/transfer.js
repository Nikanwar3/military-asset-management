const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  quantity: { type: Number, required: true },
  fromBase: { type: String, required: true },
  toBase: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  initiatedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Transfer', transferSchema);
