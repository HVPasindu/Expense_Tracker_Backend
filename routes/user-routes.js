const express = require('express');
const router = express.Router();

const {
    registerUser,
    verifyEmailOtp,
    resendOtp,
    loginUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendResetOtp

} = require('../controllers/user-controller');

router.post('/register', registerUser);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);


router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-otp', resendResetOtp);

module.exports = router;