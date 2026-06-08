const express = require('express');
const router = express.Router();
const Signature = require('../models/Signature');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { documentId, x, y, page, sigImage } = req.body;
    const signature = await Signature.create({
      document: documentId,
      signer: req.user.id,
      x, y, page, sigImage
    });
    res.status(201).json(signature);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:documentId', auth, async (req, res) => {
  try {
    const signatures = await Signature.find({ document: req.params.documentId });
    res.json(signatures);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;