const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'signed', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);