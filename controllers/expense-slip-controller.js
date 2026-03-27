const fs = require('fs');
const path = require('path');
const connection = require('../db/db-connection');

const uploadExpenseSlip = (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.expenseId;

        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }

        // check ownership
        const checkExpenseQuery = `
            SELECT * FROM expenses
            WHERE id = ? AND user_id = ?
        `;

        connection.query(checkExpenseQuery, [expenseId, userId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Expense not found'
                });
            }

            const filePath = req.file.path;

            const insertQuery = `
                INSERT INTO expense_slips (expense_id, file_path)
                VALUES (?, ?)
            `;

            connection.query(insertQuery, [expenseId, filePath], (insertErr, result) => {
                if (insertErr) {
                    return res.status(500).json({
                        message: 'Error saving file path',
                        error: insertErr.message
                    });
                }

                return res.status(201).json({
                    message: 'Expense slip uploaded successfully',
                    file: filePath
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


const getExpenseSlipsByExpenseId = (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.expenseId;

        const checkExpenseQuery = `
            SELECT * FROM expenses
            WHERE id = ? AND user_id = ?
        `;

        connection.query(checkExpenseQuery, [expenseId, userId], (checkErr, expenseResults) => {
            if (checkErr) {
                return res.status(500).json({
                    message: 'Database error while checking expense',
                    error: checkErr.message
                });
            }

            if (expenseResults.length === 0) {
                return res.status(404).json({
                    message: 'Expense not found'
                });
            }

            const getSlipsQuery = `
                SELECT * FROM expense_slips
                WHERE expense_id = ?
                ORDER BY uploaded_at DESC, id DESC
            `;

            connection.query(getSlipsQuery, [expenseId], (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Database error while fetching expense slips',
                        error: err.message
                    });
                }

                const slips = results.map((slip) => ({
                    ...slip,
                    file_url: `http://localhost:${process.env.PORT || 3000}/${slip.file_path.replace(/\\/g, '/')}`
                }));

                return res.status(200).json({
                    message: 'Expense slips fetched successfully',
                    slips
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

const deleteExpenseSlipById = (req, res) => {
    try {
        const userId = req.user.id;
        const slipId = req.params.slipId;

        const getSlipQuery = `
            SELECT es.*, e.user_id
            FROM expense_slips es
            INNER JOIN expenses e ON es.expense_id = e.id
            WHERE es.id = ? AND e.user_id = ?
        `;

        connection.query(getSlipQuery, [slipId, userId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error while fetching expense slip',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Expense slip not found'
                });
            }

            const slip = results[0];
            const filePath = slip.file_path;

            const deleteSlipQuery = `
                DELETE FROM expense_slips
                WHERE id = ?
            `;

            connection.query(deleteSlipQuery, [slipId], (deleteErr) => {
                if (deleteErr) {
                    return res.status(500).json({
                        message: 'Database error while deleting expense slip',
                        error: deleteErr.message
                    });
                }

                if (filePath) {
                    fs.unlink(filePath, (fileErr) => {
                        if (fileErr) {
                            console.log('File delete error:', fileErr.message);
                        }
                    });
                }

                return res.status(200).json({
                    message: 'Expense slip deleted successfully'
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
    uploadExpenseSlip,
    getExpenseSlipsByExpenseId,
    deleteExpenseSlipById
};