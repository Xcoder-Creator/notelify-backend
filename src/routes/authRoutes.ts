import { Router } from 'express';
import login from '../controllers/authControllers/login.controller';
import rateLimit from "express-rate-limit";
import register from '../controllers/authControllers/register.controller';
import verify from '../controllers/authControllers/verify.controller';
import forgotPassword from '../controllers/authControllers/forgotPassword.controller';
import resetPassword from '../controllers/authControllers/resetPassword.controller';
import userAuth from '../controllers/authControllers/userAuth.controller';
import { authentication } from '../middleware/auth';
import resendVerificationLink from '../controllers/authControllers/resendVerificationLink.controller';
import checkResetToken from '../controllers/authControllers/checkResetToken.controller';

/* 
    This is the auth route where all the endpoints for
    authentication are grouped together.
*/

const router = Router();

// Rate limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            message: `Too many login attempts. Please try again after ${Math.ceil((req.rateLimit.resetTime?.getTime()! - Date.now()) / (60 * 1000)) } minutes`
        });
    }
});

router.post('/login', loginLimiter, login); // For login

router.post('/signup', register); // For registration

router.get('/verify-account/:token', verify); // For account verification

router.post('/forgot-password', forgotPassword); // For forgot password

router.get('/check-reset-token/:token', checkResetToken); // For checking reset password token

router.post('/reset-password/:token', resetPassword); // For reset password

router.post('/user-auth', authentication, userAuth); // For user authentication

router.post('/resend-verification-link', resendVerificationLink); // For resending verification link

export default router;