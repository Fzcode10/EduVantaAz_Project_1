const express = require('express');
const { sendOTP, verifyOTP, register, login, createStaff, completeProfile } = require('../controllers/authControllers');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);

router.post('/create-staff', verifyToken, createStaff);
router.put('/complete-profile', verifyToken, completeProfile);

module.exports = router;
