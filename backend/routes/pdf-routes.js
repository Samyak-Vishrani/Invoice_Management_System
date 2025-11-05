const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdf-controller');
const authMiddleware = require('../middleware/middleware');

// router.use(authMiddleware.userMiddleware);

router.post('/generate/:invoiceId', authMiddleware.userMiddleware, pdfController.generateInvoicePDF);
router.get('/download/:invoiceId', authMiddleware.userMiddleware, pdfController.downloadInvoicePDF);
router.get('/view/:invoiceId', authMiddleware.clientMiddleware, pdfController.viewInvoicePDF);
router.put('/regenerate/:invoiceId', authMiddleware.userMiddleware, pdfController.regenerateInvoicePDF);
router.delete('/delete/:invoiceId', authMiddleware.userMiddleware, pdfController.deleteInvoicePDF);


router.post('/generatecloud/:invoiceId', authMiddleware.userMiddleware, pdfController.generateInvoicePDFCloudinary);

module.exports = router;