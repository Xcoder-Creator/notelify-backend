import { Request, Response } from 'express';
import Joi from 'joi';
import { UserAccount } from '../../models/index';
import crypto from 'crypto';
import { VerificationToken } from '../../models/index';
import { sendMail } from '../../utils/mailer';
import { API_URL } from '../../config/env';

/**
 * Data Transfer Object for resend verification link.
 */
interface ResendVerifLinkDTO {
    email: string;
}

// The resend verification link schema
const resendVerificationLinkSchema = Joi.object<ResendVerifLinkDTO>({
    email: Joi.string().required().min(1).trim()
});

/**
 * Resend verification link controller.
 */
const resendVerificationLink = async (req: Request, res: Response) => {
    const { error, value } = resendVerificationLinkSchema.validate(req.body, { abortEarly: false }); // Validate the email

    // If the validation is successful, proceed with the resend verification link logic
    if (!error) {
        const { email } = value; // The sanitized email
        
        try {
            // Check if the user exists based on the provided email
            const existingUser = await UserAccount.findOne({
                where: {
                    email: email
                }
            });

            if (existingUser) {
                if (!existingUser.is_verified) {
                    try {
                        const token = crypto.randomBytes(32).toString("hex"); // Generate a verification token for the user

                        // Save the token in the DB with expiry
                        await VerificationToken.create({
                            user_id: existingUser.id,
                            verification_token: token,
                            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
                        });

                        const verificationUrl = `${API_URL}/auth/verify-account/${token}`; // Construct the verification URL

                        try {
                            // Send the verification email
                            await sendMail(
                                email, 
                                'Verify your email', 
                                `Click the link to verify your email: ${verificationUrl}`, 
                                `<a href="${verificationUrl}">Verify your email</a>`
                            );
                        } catch (error) {
                            console.error('Error sending verification email:', error);
                        }
                    } catch (error) {
                        console.error('Error saving verification token:', error);
                    }

                    return res.status(200).json({ message: "A new verification link has been sent to your email" });
                } else {
                    return res.status(401).json({ message: "This account has already been verified!" });
                }
            } else {
                return res.status(404).json({ message: "This user does not exist" });
            }
        } catch (error) {
            console.error('Error resending the verification link to the user:', error);
            return res.status(500).json({ message: "An error occurred while resending the verification link. please try again!" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default resendVerificationLink;