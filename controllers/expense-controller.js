const connection = require('../db/db-connection');



const addExpense = (req, res) => {
    try {
        const userId = req.user.id;
        const { title, amount, expense_date, note } = req.body;

        if (!title || !amount || !expense_date) {
            return res.status(400).json({
                message: 'Title, amount and expense date are required'
            });
        }

        const insertExpenseQuery = `
            INSERT INTO expenses (user_id, title, amount, expense_date, note)
            VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(
            insertExpenseQuery,
            [userId, title, amount, expense_date, note || null],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Database error while adding expense',
                        error: err.message
                    });
                }

                return res.status(201).json({
                    message: 'Expense added successfully',
                    expenseId: result.insertId
                });
            }
        );
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


const getAllExpenses = (req, res) => {
    try {
        const userId = req.user.id;

        const getExpensesQuery = `
            SELECT * FROM expenses
            WHERE user_id = ?
            ORDER BY expense_date DESC, id DESC
        `;

        connection.query(getExpensesQuery, [userId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching expenses',
                    error: err.message
                });
            }

            return res.status(200).json({
                message: 'Expenses fetched successfully',
                expenses: results
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


const getExpenseById = (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        const getExpenseQuery = `
            SELECT * FROM expenses
            WHERE id = ? AND user_id = ?
        `;

        connection.query(getExpenseQuery, [expenseId, userId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching expense',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Expense not found'
                });
            }

            return res.status(200).json({
                message: 'Expense fetched successfully',
                expense: results[0]
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const updateExpenseById = (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;
        const { title, amount, expense_date, note } = req.body;

        if (!title || !amount || !expense_date) {
            return res.status(400).json({
                message: 'Title, amount and expense date are required'
            });
        }

        const checkExpenseQuery = `
            SELECT * FROM expenses
            WHERE id = ? AND user_id = ?
        `;

        connection.query(checkExpenseQuery, [expenseId, userId], (checkErr, results) => {
            if (checkErr) {
                return res.status(500).json({
                    message: 'Database error while checking expense',
                    error: checkErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Expense not found'
                });
            }

            const updateExpenseQuery = `
                UPDATE expenses
                SET title = ?, amount = ?, expense_date = ?, note = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            `;

            connection.query(
                updateExpenseQuery,
                [title, amount, expense_date, note || null, expenseId, userId],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            message: 'Database error while updating expense',
                            error: updateErr.message
                        });
                    }

                    return res.status(200).json({
                        message: 'Expense updated successfully'
                    });
                }
            );
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteExpenseById = (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

        const checkExpenseQuery = `
            SELECT * FROM expenses
            WHERE id = ? AND user_id = ?
        `;

        connection.query(checkExpenseQuery, [expenseId, userId], (checkErr, results) => {
            if (checkErr) {
                return res.status(500).json({
                    message: 'Database error while checking expense',
                    error: checkErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Expense not found'
                });
            }

            const deleteExpenseQuery = `
                DELETE FROM expenses
                WHERE id = ? AND user_id = ?
            `;

            connection.query(deleteExpenseQuery, [expenseId, userId], (deleteErr) => {
                if (deleteErr) {
                    return res.status(500).json({
                        message: 'Database error while deleting expense',
                        error: deleteErr.message
                    });
                }

                return res.status(200).json({
                    message: 'Expense deleted successfully'
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    addExpense,
    getAllExpenses,
    getExpenseById,
    updateExpenseById,
    deleteExpenseById
};