const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const verifyToken = require('../middleware/auth-middleware');

const {
    uploadExpenseSlip,
    getExpenseSlipsByExpenseId
} = require('../controllers/expense-slip-controller');

// upload single file
router.post(
    '/:expenseId',
    verifyToken,
    upload.single('slip'),
    uploadExpenseSlip
);

router.get('/:expenseId', verifyToken, getExpenseSlipsByExpenseId);

module.exports = router;