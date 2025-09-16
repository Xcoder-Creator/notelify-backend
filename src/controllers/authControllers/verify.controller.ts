import { Request, Response } from 'express';
import Joi from 'joi';
import { RefreshToken, UserAccount } from '../../models/index';
import { VerificationToken } from '../../models/index';
import { sendMail } from '../../utils/mailer';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../../config/env';
import jwt from 'jsonwebtoken';

/**
 * Data Transfer Object for user account verification.
 */
interface VerifyAccountDTO {
    token: string;
}

// The verify account schema
const verifyAccountSchema = Joi.object<VerifyAccountDTO>({
    token: Joi.string().required().trim()
});

/**
 * Verify user account controller.
 */
const verify = async (req: Request, res: Response) => {
    const { error, value } = verifyAccountSchema.validate(req.params, { abortEarly: false }); // Validate the users registeration details

    // If the validation is successful, proceed with the verification logic
    if (!error) {
        const { token } = value; // The sanitized token

        try {
            // Find the verification token in the database
            const verifToken = await VerificationToken.findOne({ 
                where: { 
                    verification_token: token 
                } 
            });

            if (verifToken) {
                // If the token is found, check if it has expired
                if (new Date() > verifToken.expires_at) {
                    return res.status(401).json({ message: "An error occurred while verifying the account" });
                }

                // If the token is valid, verify the user account
                await UserAccount.update({ 
                    is_verified: true 
                }, { 
                    where: { 
                        id: verifToken.user_id 
                    } 
                });

                let userID = verifToken.user_id; // The users ID

                // Delete all the verification tokens for this user from the database
                await VerificationToken.destroy({ where: { user_id: verifToken.user_id } });

                // Get the users account details
                let userAcct = await UserAccount.findOne({ where: { id: userID } });

                if (userAcct) {
                    try {  
                        // Send the verification email
                        await sendMail(
                            userAcct.email, 
                            'Account Verification', 
                            `Your account has been verified successfully!`, 
                            `<p>Your account has been verified successfully. You can now log in and start creating notes.</p>`
                        );
                    } catch (error) {
                        console.error('Error sending verification email:', error);
                    }

                    // Generate JWT access token
                    const accessToken = jwt.sign({ id: userAcct.id, email: userAcct.email }, ACCESS_TOKEN_SECRET as string, {
                        algorithm: "HS512",
                        expiresIn: "15m"
                    });

                    // Generate JWT refresh token
                    const refreshToken = jwt.sign({ id: userAcct.id, email: userAcct.email }, REFRESH_TOKEN_SECRET as string, {
                        algorithm: "HS512",
                        expiresIn: "7d"
                    });

                    // Store refresh token in database
                    await RefreshToken.create({
                        user_id: userAcct.id,
                        refresh_token: refreshToken
                    });

                    // Create a http-only cookie for the refresh token
                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        secure: false,   // must be false on localhost
                        sameSite: "strict",
                        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                    });

                    // The users data
                    const userData = {
                        userID: userAcct.id,
                        email: userAcct.email,
                        username: userAcct.username,
                        profileImage: null,
                        verified: userAcct.is_verified,
                        accessToken: accessToken
                    }

                    return res.status(200).json({ message: "User account verified successfully", userData: userData });
                } else {
                    return res.status(401).json({ message: "An error occurred while verifying the account" });
                }
            } else {
                return res.status(401).json({ message: "An error occurred while verifying the account" });
            }
        } catch (error) {
            console.error('Error verifying users account:', error);
            return res.status(500).json({ message: "An error occurred while verifying the account" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default verify;