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

module.exports = {
    uploadExpenseSlip,
    getExpenseSlipsByExpenseId
};