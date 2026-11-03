import express from "express";
import { login, logout, register, sendVerifyOtp, verifyEmail } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-verify-otp', userAuth, sendVerifyOtp);
router.post('/verify-account', userAuth, verifyEmail);

//http://localhost/4000/api/auth/register

export default router;