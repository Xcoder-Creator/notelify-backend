import { Request, Response } from 'express';
import Joi from 'joi';
import { UserAccount, VerificationToken } from '../../models/index';
import crypto from 'crypto';
import { sendMail } from '../../utils/mailer';
import { ResetPasswordToken } from '../../models/index';
import {API_URL } from '../../config/env';
import { Op } from 'sequelize';

/**
 * Data Transfer Object for forgot password.
 */
interface ForgotPasswordDTO {
    emailOrUsername: string;
}

// The forgot password schema
const forgotPasswordSchema = Joi.object<ForgotPasswordDTO>({
    emailOrUsername: Joi.string().required().min(1).trim()
});

/**
 * Forgot password controller.
 */
const forgotPassword = async (req: Request, res: Response) => {
    const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false }); // Validate the users email

    // If the validation is successful, proceed with the verification logic
    if (!error) {
        const { emailOrUsername } = value; // The sanitized email or username

        try {
            // Check if the user exists based on their email or username
            const user = await UserAccount.findOne({
                where: {
                    [Op.or]: [
                        { email: emailOrUsername },
                        { username: emailOrUsername },
                    ],
                }
            });

            if (user) {
                if (user.is_verified){
                    const token = crypto.randomBytes(32).toString("hex"); // Generate a reset password token for the user

                    try {
                        // Save the token in the DB with expiry
                        await ResetPasswordToken.create({
                            user_id: user.id,
                            reset_password_token: token,
                            expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1h
                        });
                    } catch (error) {
                        console.error('Error saving reset password token:', error);
                        return res.status(500).json({ message: "An error just occurred" });
                    }

                    const resetPasswordUrl = `${API_URL}/auth/reset-password/${token}`; // Construct the reset password URL

                    try {
                        // Send the reset password email
                        await sendMail(
                            user.email, 
                            'Password Reset', 
                            `Click the link to reset your password: ${resetPasswordUrl}`, 
                            `
                                <p>Click the link below to reset your password:</p>
                                <a href="${resetPasswordUrl}">Reset your password</a>
                            `
                        );
                    } catch (error) {
                        console.error('Error sending reset password email for user:', error);
                    }

                    return res.status(200).json({ message: "If this email exists, you will receive a password reset link." });
                } else {
                    const token = crypto.randomBytes(32).toString("hex"); // Generate a verification token for the user

                    try {
                        // Save the token in the DB with expiry
                        await VerificationToken.create({
                            user_id: user.id,
                            verification_token: token,
                            expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1h
                        });
                    } catch (error) {
                        console.error('Error saving verification token:', error);
                    }

                    const verifyAccountUrl = `${API_URL}/auth/verify-account/${token}`; // Construct the verify account link

                    try {
                        // Send the reset password email
                        await sendMail(
                            user.email, 
                            'Verify Account', 
                            `Click the link to verify your account: ${verifyAccountUrl}`, 
                            `
                                <p>Click the link below to verify your account:</p>
                                <a href="${verifyAccountUrl}">Verify your account</a>
                            `
                        );
                    } catch (error) {
                        console.error('Error sending account verification email for user:', error);
                    }

                    return res.status(403).json({ message: "In order to reset your password, you need to verify your account. A verification link has just been sent to your email." });
                }
            } else {
                return res.status(200).json({ message: "If this email exists, you will receive a password reset link." });
            }
        } catch (error) {
            console.error('Error sending reset password email for user:', error);
            return res.status(500).json({ message: "An error just occurred" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default forgotPassword;