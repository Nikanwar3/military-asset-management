const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  quantity: { type: Number, required: true },
  base: { type: String, required: true },
  assignedTo: { type: String, required: true },
  type: {
    type: String,
    enum: ['Assignment', 'Expenditure'],
    required: true
  },
  assignedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
