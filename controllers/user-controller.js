const bcrypt = require('bcrypt');
const connection = require('../db/db-connection');
const sendOtpEmail = require('../services/send-email');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone_number } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], async (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while checking email',
                    error: findErr.message
                });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            const hashedPassword = await bcrypt.hash(password, 10);

            // 1. email have + verified true
            if (results.length > 0 && results[0].is_email_verified === 1) {
                return res.status(400).json({
                    message: 'This email is already registered and verified'
                });
            }

            // 2. email have + verified false
            if (results.length > 0 && results[0].is_email_verified === 0) {
                const updateUserQuery = `
                    UPDATE users
                    SET name = ?, password_hash = ?, phone_number = ?, otp_code = ?, otp_expires_at = ?
                    WHERE email = ?
                `;

                connection.query(
                    updateUserQuery,
                    [name, hashedPassword, phone_number || null, otpCode, otpExpiresAt, email],
                    async (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({
                                message: 'Database error while updating unverified user',
                                error: updateErr.message
                            });
                        }

                        // TODO: for now
                        console.log(`OTP for ${email}: ${otpCode}`);

                        try {
                            await sendOtpEmail(email, otpCode);

                            return res.status(200).json({
                                message: 'Unverified user updated. New OTP sent to email'
                            });
                        } catch (emailErr) {
                            return res.status(500).json({
                                message: 'User updated, but failed to send OTP email',
                                error: emailErr.message
                            });
                        }



                    }
                );

                return;
            }

            // 3. new user kenek
            const insertUserQuery = `
                INSERT INTO users
                (name, email, password_hash, phone_number, is_email_verified, otp_code, otp_expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(
                insertUserQuery,
                [name, email, hashedPassword, phone_number || null, 0, otpCode, otpExpiresAt],
                async (insertErr, insertResult) => {
                    if (insertErr) {
                        return res.status(500).json({
                            message: 'Database error while registering user',
                            error: insertErr.message
                        });
                    }

                    // TODO: for now
                    console.log(`OTP for ${email}: ${otpCode}`);

                    try {
                        await sendOtpEmail(email, otpCode);

                        return res.status(201).json({
                            message: 'User registered successfully. OTP sent to email',
                            userId: insertResult.insertId
                        });
                    } catch (emailErr) {
                        return res.status(500).json({
                            message: 'User registered, but failed to send OTP email',
                            error: emailErr.message
                        });
                    }



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

const verifyEmailOtp = (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const findUserQuery = `
            SELECT * FROM users
            WHERE email = ?
        `;

        connection.query(findUserQuery, [email], (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            if (user.is_email_verified === 1) {
                return res.status(400).json({
                    message: 'Email is already verified'
                });
            }

            if (!user.otp_code || !user.otp_expires_at) {
                return res.status(400).json({
                    message: 'No OTP found for this email'
                });
            }

            if (user.otp_code !== otp) {
                return res.status(400).json({
                    message: 'Invalid OTP'
                });
            }

            const now = new Date();
            const expiresAt = new Date(user.otp_expires_at);

            if (now > expiresAt) {
                return res.status(400).json({
                    message: 'OTP has expired'
                });
            }

            const verifyUserQuery = `
                UPDATE users
                SET is_email_verified = 1,
                    otp_code = NULL,
                    otp_expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;

            connection.query(verifyUserQuery, [email], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        message: 'Database error while verifying email',
                        error: updateErr.message
                    });
                }

                return res.status(200).json({
                    message: 'Email verified successfully'
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


const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], async (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            if (user.is_email_verified === 1) {
                return res.status(400).json({
                    message: 'Email is already verified'
                });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            const updateOtpQuery = `
                UPDATE users
                SET otp_code = ?, otp_expires_at = ?, updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;

            connection.query(
                updateOtpQuery,
                [otpCode, otpExpiresAt, email],
                async (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            message: 'Database error while updating OTP',
                            error: updateErr.message
                        });
                    }

                    try {
                        await sendOtpEmail(email, otpCode);

                        return res.status(200).json({
                            message: 'New OTP sent successfully'
                        });
                    } catch (emailErr) {
                        return res.status(500).json({
                            message: 'OTP updated, but failed to send email',
                            error: emailErr.message
                        });
                    }
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


const loginUser = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], async (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            if (user.is_email_verified === 0) {
                return res.status(403).json({
                    message: 'Please verify your email before login'
                });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordMatch) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
                }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone_number: user.phone_number
                }
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// forgot password - send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], async (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            // security nisa generic response ekak danna puluwan
            if (results.length === 0) {
                return res.status(200).json({
                    message: 'If an account exists, an OTP has been sent to the email'
                });
            }

            const user = results[0];

            const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            const updateResetOtpQuery = `
                UPDATE users
                SET reset_otp = ?, reset_otp_expires_at = ?, updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;

            connection.query(
                updateResetOtpQuery,
                [resetOtp, resetOtpExpiresAt, email],
                async (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            message: 'Database error while saving reset OTP',
                            error: updateErr.message
                        });
                    }

                    try {
                        await sendOtpEmail(email, resetOtp);

                        return res.status(200).json({
                            message: 'If an account exists, an OTP has been sent to the email'
                        });
                    } catch (emailErr) {
                        return res.status(500).json({
                            message: 'Failed to send reset OTP email',
                            error: emailErr.message
                        });
                    }
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


const verifyResetOtp = (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            if (!user.reset_otp || !user.reset_otp_expires_at) {
                return res.status(400).json({
                    message: 'No reset OTP found'
                });
            }

            if (user.reset_otp !== otp) {
                return res.status(400).json({
                    message: 'Invalid OTP'
                });
            }

            const now = new Date();
            const expiresAt = new Date(user.reset_otp_expires_at);

            if (now > expiresAt) {
                return res.status(400).json({
                    message: 'OTP has expired'
                });
            }

            const updateVerifyQuery = `
                UPDATE users
                SET is_reset_password_verified = 1,
                    reset_otp = NULL,
                    reset_otp_expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;

            connection.query(updateVerifyQuery, [email], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        message: 'Database error while verifying reset OTP',
                        error: updateErr.message
                    });
                }

                return res.status(200).json({
                    message: 'OTP verified successfully'
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


const resetPassword = async (req, res) => {
    try {
        const { email, new_password } = req.body;

        if (!email || !new_password) {
            return res.status(400).json({
                message: 'Email and new password are required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], async (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            if (user.is_reset_password_verified !== 1) {
                return res.status(400).json({
                    message: 'Reset password verification not completed'
                });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);

            const updatePasswordQuery = `
                UPDATE users
                SET password_hash = ?,
                    is_reset_password_verified = 0,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;

            connection.query(
                updatePasswordQuery,
                [hashedPassword, email],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            message: 'Database error while resetting password',
                            error: updateErr.message
                        });
                    }

                    return res.status(200).json({
                        message: 'Password reset successfully'
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


const resendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';

        connection.query(findUserQuery, [email], async (findErr, results) => {
            if (findErr) {
                return res.status(500).json({
                    message: 'Database error while finding user',
                    error: findErr.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            const updateResetOtpQuery = `
                UPDATE users
                SET reset_otp = ?,
                    reset_otp_expires_at = ?,
                    is_reset_password_verified = 0,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `;

            connection.query(
                updateResetOtpQuery,
                [resetOtp, resetOtpExpiresAt, email],
                async (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({
                            message: 'Database error while updating reset OTP',
                            error: updateErr.message
                        });
                    }

                    try {
                        await sendOtpEmail(email, resetOtp);

                        return res.status(200).json({
                            message: 'New reset OTP sent successfully'
                        });
                    } catch (emailErr) {
                        return res.status(500).json({
                            message: 'Reset OTP updated, but failed to send email',
                            error: emailErr.message
                        });
                    }
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



module.exports = {
    registerUser,
    verifyEmailOtp,
    resendOtp,
    loginUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendResetOtp
};