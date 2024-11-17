const express = require('express');
const otpdata = require("../model/Otp");
const router = express.Router();

router.post('/verify-otpz', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        // Check if the OTP exists and matches
        const otpRecord = await otpdata.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP is valid, proceed with verification
          await otp.deleteOne({ email, otp });
        res.status(200).json({ message: 'OTP verified successfully!' });

        // Optionally delete the OTP record after successful verification
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while verifying OTP.' });
    }
});


module.exports = router;