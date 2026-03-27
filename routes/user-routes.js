const express = require('express');
const router = express.Router();

const {
    registerUser,
    verifyEmailOtp,
    resendOtp,
    loginUser
} = require('../controllers/user-controller');

router.post('/register', registerUser);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);

module.exports = router;