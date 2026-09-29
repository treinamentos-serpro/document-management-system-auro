const express = require('express');
const { rateLimit } = require('express-rate-limit');
const multer = require('multer');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const documentController = require('../controllers/documentController');

const router = express.Router();
const downloadRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas solicitações de download.' },
});
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(__dirname, '../../storage'));
    },
    filename: (req, file, callback) => {
      callback(null, randomUUID());
    },
  }),
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get(
  '/documents/:id/download',
  downloadRateLimit,
  documentController.download,
);

module.exports = router;
