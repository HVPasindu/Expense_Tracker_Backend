const express = require('express');
const router = express.Router();

const { addExpense,
    getAllExpenses,
    getExpenseById,
    updateExpenseById,
    deleteExpenseById } = require('../controllers/expense-controller');
const verifyToken = require('../middleware/auth-middleware');

router.post('/', verifyToken, addExpense);
router.get('/', verifyToken, getAllExpenses);
router.get('/:id', verifyToken, getExpenseById);
router.put('/:id', verifyToken, updateExpenseById);
router.delete('/:id', verifyToken, deleteExpenseById);

module.exports = router;