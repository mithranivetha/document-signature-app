const express = require('express');
const router = express.Router();
const Signature = require('../models/Signature');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Save signature position
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, x, y, page } = req.body;
    const signature = await Signature.create({
      document: documentId,
      signer: req.user.id,
      x, y, page
    });
    res.status(201).json(signature);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get signatures for a document
router.get('/:documentId', auth, async (req, res) => {
  try {
    const signatures = await Signature.find({ document: req.params.documentId });
    res.json(signatures);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;