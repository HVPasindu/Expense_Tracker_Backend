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

        // const getExpensesQuery = `
        //     SELECT * FROM expenses
        //     WHERE user_id = ?
        //     ORDER BY expense_date DESC, id DESC
        // `;

        const getExpensesQuery = `
    SELECT 
        id,
        user_id,
        title,
        amount,
        DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
        note,
        created_at,
        updated_at
    FROM expenses
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

        // const getExpenseQuery = `
        //     SELECT * FROM expenses
        //     WHERE id = ? AND user_id = ?
        // `;

        const getExpenseQuery = `
    SELECT 
        id,
        user_id,
        title,
        amount,
        DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
        note,
        created_at,
        updated_at
    FROM expenses
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

const getExpensesBySpecificDate = (req, res) => {
    try {
        const userId = req.user.id;
        const expenseDate = req.params.expense_date;

        // const getExpensesQuery = `
        //     SELECT * FROM expenses
        //     WHERE user_id = ? AND expense_date = ?
        //     ORDER BY created_at DESC, id DESC
        // `;


        const getExpensesQuery = `
    SELECT 
        id,
        user_id,
        title,
        amount,
        DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
        note,
        created_at,
        updated_at
    FROM expenses
    WHERE user_id = ? AND expense_date = ?
    ORDER BY created_at DESC, id DESC
`;

        connection.query(getExpensesQuery, [userId, expenseDate], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching expenses by date',
                    error: err.message
                });
            }

            // const totalAmount = results.reduce((sum, expense) => {
            //     return sum + parseFloat(expense.amount);
            // }, 0);

            let totalAmount = 0;

            for (const expense of results) {
                totalAmount += parseFloat(expense.amount);
            }

            return res.status(200).json({
                message: 'Expenses fetched successfully for the specific date',
                expense_date: expenseDate,
                total_amount: totalAmount,
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


const getExpensesByDateRange = (req, res) => {
    try {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                message: 'Start date and end date are required'
            });
        }

        if (start_date > end_date) {
            return res.status(400).json({
                message: 'Start date cannot be greater than end date'
            });
        }

        const getExpensesQuery = `
            SELECT 
                id,
                user_id,
                title,
                amount,
                DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
                note,
                created_at,
                updated_at
            FROM expenses
            WHERE user_id = ? AND expense_date BETWEEN ? AND ?
            ORDER BY expense_date DESC, id DESC
        `;

        connection.query(getExpensesQuery, [userId, start_date, end_date], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching expenses by date range',
                    error: err.message
                });
            }

            let totalAmount = 0;

            for (const expense of results) {
                totalAmount += parseFloat(expense.amount);
            }

            return res.status(200).json({
                message: 'Expenses fetched successfully for the date range',
                start_date,
                end_date,
                total_amount: totalAmount,
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


const getWeeklyExpenses = (req, res) => {
    try {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                message: 'Start date and end date are required'
            });
        }

        if (start_date > end_date) {
            return res.status(400).json({
                message: 'Start date cannot be greater than end date'
            });
        }

        const getWeeklyExpensesQuery = `
            SELECT 
                id,
                user_id,
                title,
                amount,
                DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
                note,
                created_at,
                updated_at
            FROM expenses
            WHERE user_id = ? AND expense_date BETWEEN ? AND ?
            ORDER BY expense_date DESC, id DESC
        `;

        connection.query(getWeeklyExpensesQuery, [userId, start_date, end_date], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching weekly expenses',
                    error: err.message
                });
            }

            let totalAmount = 0;

            for (const expense of results) {
                totalAmount += parseFloat(expense.amount);
            }

            return res.status(200).json({
                message: 'Weekly expenses fetched successfully',
                start_date,
                end_date,
                total_amount: totalAmount,
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


const getMonthlyExpenses = (req, res) => {
    try {
        const userId = req.user.id;
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                message: 'Year and month are required'
            });
        }

        const getMonthlyExpensesQuery = `
            SELECT 
                id,
                user_id,
                title,
                amount,
                DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
                note,
                created_at,
                updated_at
            FROM expenses
            WHERE user_id = ?
              AND YEAR(expense_date) = ?
              AND MONTH(expense_date) = ?
            ORDER BY expense_date DESC, id DESC
        `;

        connection.query(getMonthlyExpensesQuery, [userId, year, month], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching monthly expenses',
                    error: err.message
                });
            }

            let totalAmount = 0;

            for (const expense of results) {
                totalAmount += parseFloat(expense.amount);
            }

            return res.status(200).json({
                message: 'Monthly expenses fetched successfully',
                year,
                month,
                total_amount: totalAmount,
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

module.exports = {
    addExpense,
    getAllExpenses,
    getExpenseById,
    updateExpenseById,
    deleteExpenseById,
    getExpensesBySpecificDate,
    getExpensesByDateRange,
    getWeeklyExpenses,
    getMonthlyExpenses
};