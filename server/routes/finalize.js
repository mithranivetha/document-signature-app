const express = require('express');
const router = express.Router();
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Signature = require('../models/Signature');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

router.post('/:docId', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const signatures = await Signature.find({ document: doc._id });
    if (signatures.length === 0) return res.status(400).json({ message: 'No signatures found' });

    // Read the original PDF
    const pdfPath = path.join(__dirname, '..', doc.filePath);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    for (const sig of signatures) {
      if (!sig.sigImage) continue;
      const pageIndex = (sig.page || 1) - 1;
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      // Convert percentage coordinates to PDF coordinates
      const x = (sig.x / 100) * width
      const y = height - (sig.y / 100) * height

      // Embed signature image
      const base64Data = sig.sigImage.replace(/^data:image\/png;base64,/, '')
      const imgBytes = Buffer.from(base64Data, 'base64')
      const img = await pdfDoc.embedPng(imgBytes)

      page.drawImage(img, {
        x: x - 60,
        y: y - 30,
        width: 120,
        height: 40,
      })
    }

    // Save the signed PDF
    const signedBytes = await pdfDoc.save();
    const signedFilename = `signed-${doc.filename}`;
    const signedPath = path.join(__dirname, '..', 'uploads', signedFilename);
    fs.writeFileSync(signedPath, signedBytes);

    // Update document status
    doc.status = 'signed';
    await doc.save();

    // Create audit log
    await AuditLog.create({
      document: doc._id,
      user: req.user.id,
      action: 'Document finalized and signed',
      ipAddress: req.ip
    });

    res.json({
      message: 'Document signed successfully',
      signedFile: signedFilename
    });
  } catch (err) {
    res.status(500).json({ message: 'Finalize failed', error: err.message });
  }
});

// Get audit log for a document
router.get('/audit/:docId', auth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ document: req.params.docId })
      .populate('user', 'name email')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;