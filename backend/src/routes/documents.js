const express = require('express');
const multer = require('multer');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const documentController = require('../controllers/documentController');

const router = express.Router();
const downloadRequests = new Map();
const downloadWindowMs = 60_000;
const downloadRequestLimit = 60;
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

function limitDownloadRequests(req, res, next) {
  const now = Date.now();
  let window = downloadRequests.get(req.ip);
  if (!window || window.resetAt <= now) {
    if (!window && downloadRequests.size >= 1000) {
      for (const [ip, entry] of downloadRequests) {
        if (entry.resetAt <= now) {
          downloadRequests.delete(ip);
        }
      }
      if (downloadRequests.size >= 1000) {
        downloadRequests.delete(downloadRequests.keys().next().value);
      }
    }

    window = { count: 0, resetAt: now + downloadWindowMs };
    downloadRequests.set(req.ip, window);
  }

  if (window.count >= downloadRequestLimit) {
    res.set('Retry-After', String(Math.ceil((window.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Muitas solicitações de download.' });
  }

  window.count += 1;
  return next();
}

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get(
  '/documents/:id/download',
  limitDownloadRequests,
  documentController.download,
);

module.exports = router;
