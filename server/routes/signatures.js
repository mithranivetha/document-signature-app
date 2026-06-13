const express = require('express');
const router = express.Router();
const Signature = require('../models/Signature');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { documentId, x, y, page, sigImage, sessionId } = req.body;
    const signature = await Signature.create({
      document: documentId,
      signer: req.user.id,
      sessionId,
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

router.patch('/:signatureId', async (req, res) => {
  try {
    const update = {}
    if (req.body.x !== undefined) update.x = req.body.x
    if (req.body.y !== undefined) update.y = req.body.y
    if (req.body.locked !== undefined) update.locked = req.body.locked
    const updated = await Signature.findByIdAndUpdate(req.params.signatureId, update, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.delete('/:signatureId', async (req, res) => {
  try {
    await Signature.findByIdAndDelete(req.params.signatureId);
    res.json({ message: 'Signature deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// For shared signers
router.post('/shared', async (req, res) => {
  try {
    const { documentId, x, y, page, sigImage, shareToken, sessionId } = req.body;
    const doc = await Document.findOne({ _id: documentId, shareToken });
    if (!doc) return res.status(403).json({ message: 'Invalid share token' });

    const signature = await Signature.create({
      document: documentId,
      signer: doc.owner,
      sessionId,
      x, y, page, sigImage
    });
    res.status(201).json(signature);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get signatures for shared document
router.get('/shared/:documentId', async (req, res) => {
  try {
    const signatures = await Signature.find({ document: req.params.documentId });
    res.json(signatures);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;