const express = require('express');
const upload = require('../config/upload');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();

router.post(
  '/upload',
  documentsController.requireOwner,
  upload.single('file'),
  documentsController.upload,
);
router.get('/documents', documentsController.requireOwner, documentsController.list);
router.get(
  '/documents/:id/download',
  documentsController.requireOwner,
  documentsController.download,
);

module.exports = router;