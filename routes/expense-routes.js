const express = require('express');
const router = express.Router();

const { addExpense,
    getAllExpenses,
    getExpenseById,
    updateExpenseById,
    deleteExpenseById,
    getExpensesBySpecificDate,
    getExpensesByDateRange,
    getWeeklyExpenses,
    getMonthlyExpenses,
    getDashboardSummary } = require('../controllers/expense-controller');
const verifyToken = require('../middleware/auth-middleware');

router.post('/', verifyToken, addExpense);
router.get('/', verifyToken, getAllExpenses);

router.get('/dashboard-summary', verifyToken, getDashboardSummary);
router.get('/date-range', verifyToken, getExpensesByDateRange);
router.get('/weekly', verifyToken, getWeeklyExpenses);
router.get('/monthly', verifyToken, getMonthlyExpenses);
router.get('/date/:expense_date', verifyToken, getExpensesBySpecificDate);

router.get('/:id', verifyToken, getExpenseById);
router.put('/:id', verifyToken, updateExpenseById);
router.delete('/:id', verifyToken, deleteExpenseById);

module.exports = router;