const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  signer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  page: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'signed', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Signature', signatureSchema);