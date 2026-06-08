const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Generate a shareable link token
router.post('/:docId', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const token = crypto.randomBytes(32).toString('hex');
    doc.shareToken = token;
    await doc.save();

    res.json({ shareUrl: `http://localhost:5173/shared/${token}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Access a shared document by token
router.get('/:token', async (req, res) => {
  try {
    const doc = await Document.findOne({ shareToken: req.params.token });
    if (!doc) return res.status(404).json({ message: 'Invalid or expired link' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;