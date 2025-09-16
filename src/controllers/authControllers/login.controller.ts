import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_SECRET, API_URL, REFRESH_TOKEN_SECRET } from '../../config/env';
import { UserAccount, VerificationToken } from '../../models/index';
import { RefreshToken } from '../../models/index';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import { Op } from 'sequelize';
import { sendMail } from '../../utils/mailer';
import crypto from 'crypto';

/**
 * Data Transfer Object for user registration.
 */
interface LoginDTO {
    emailOrUsername: string;
    password: string;
}

// The login schema
const loginSchema = Joi.object<LoginDTO>({
    emailOrUsername: Joi.string().required().min(1).trim().messages({
        "string.min": "Email or Username cannot be empty"
    }),
    password: Joi.string().required().min(1).trim().messages({
        "string.min": "Password cannot be empty"
    })
});

/**
 * User login controller.
 */
const login = async (req: Request, res: Response) => {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false }); // Validate the users login details

    // If the validation is successful, proceed with the login logic
    if (!error) {
        const { emailOrUsername, password } = value; // The sanitized versions of the users login details

        try {
            // Check if the user exists based on their email
            const user = await UserAccount.findOne({
                where: {
                    [Op.or]: [
                        { email: emailOrUsername },
                        { username: emailOrUsername },
                    ],
                }
            });

            if (user){
                if (user.is_verified){
                    const now = new Date(); // Get the current date and time

                    // Convert the lock until timestamp from a string into a valid timestamp
                    let lockUntil = user.lock_until ? new Date(user.lock_until) : null;

                    if (lockUntil) {
                        // Check if the account is currently locked
                        if (lockUntil > now) {
                            return res.status(429).json({
                                message: `Too many login attempts. Please try again after ${Math.ceil(
                                    (lockUntil.getTime() - now.getTime()) / (60 * 1000)
                                )} minutes`
                            });
                        } else {
                            // Lock expired → reset
                            user.lock_until = null;
                            user.login_attempts = 0;
                            await user.save();
                        }
                    }

                    // If enough time has passed since last failed attempt → reset attempts
                    if (
                        user.last_failed_login &&
                        now.getTime() - new Date(user.last_failed_login).getTime() > 15 * 60 * 1000 // 15 minutes
                    ) {
                        user.login_attempts = 0;
                        user.last_failed_login = null;
                        await user.save();
                    }

                    const isMatch = await bcrypt.compare(password, user.password_hash);

                    // Check if the password that the user provided matches the hashed password
                    if (isMatch) {
                        // successful login → reset attempts
                        user.login_attempts = 0;
                        user.lock_until = null;
                        user.last_failed_login = null;
                        await user.save();

                        // Generate JWT access token
                        const accessToken = jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET as string, {
                            algorithm: "HS512",
                            expiresIn: "15m"
                        });

                        // Generate JWT refresh token
                        const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET as string, {
                            algorithm: "HS512",
                            expiresIn: "7d"
                        });

                        // Store refresh token in database
                        const newUser = await RefreshToken.create({
                            user_id: user.id,
                            refresh_token: refreshToken
                        });

                        // Check if the refresh token was stored successfully
                        if (newUser) {
                            // Create a http-only cookie for the refresh token
                            res.cookie("refreshToken", refreshToken, {
                                httpOnly: true,
                                secure: false,   // must be false on localhost
                                sameSite: "strict",
                                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                            });

                            // The users data
                            const userData = {
                                userID: user.id,
                                email: user.email,
                                username: user.username,
                                profileImage: null,
                                verified: user.is_verified,
                                accessToken: accessToken
                            }

                            return res.status(200).json({ message: "Login successful", userData: userData });
                        }

                        return res.status(500).json({ message: "An error occurred while trying to login" });
                    } else {
                        user.login_attempts += 1; // Increment login attempts
                        user.last_failed_login = now; // Keep track of last failed login

                        // If the login attempts exceed the limit, lock the account
                        if (user.login_attempts >= 5) {
                            user.lock_until = new Date(now.getTime() + 15 * 60 * 1000); // Lock for 15 mins
                            await user.save();
                            return res.status(429).json({ message: "Too many login attempts. Please try again after 15 minutes" });
                        }

                        await user.save();

                        return res.status(401).json({ message: "The email or password is incorrect" });
                    }
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

                    return res.status(403).json({ message: "Your account is yet to be verified. Please verify your account in order for you to login. A verification link has been sent to your email.", email: user.email });
                }
            } else {
                return res.status(401).json({ message: "The email or password is incorrect" });
            }
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: "An error occurred while trying to login" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default login;