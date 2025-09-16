import { Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import { UserAccount } from '../../models/index';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { VerificationToken } from '../../models/index';
import { sendMail } from '../../utils/mailer';
import { API_URL } from '../../config/env';

/**
 * Data Transfer Object for user registration.
 */
interface RegisterDTO {
    email: string;
    username: string;
    password: string;
}

// The registration schema
const registerSchema = Joi.object<RegisterDTO>({
    email: Joi.string().email().required().trim().lowercase(),
    username: Joi.string().min(5).max(15).required().trim().lowercase(),
    password: Joi.string().min(6).max(15).required().trim()
});

/**
 * User registration controller.
 */
const register = async (req: Request, res: Response) => {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false }); // Validate the users registeration details

    // If the validation is successful, proceed with the registration logic
    if (!error) {
        const { email, username, password } = value; // The sanitized versions of the users registration details
        
        try {
            // Check if username or email exists
            const existingUser = await UserAccount.findOne({
                where: {
                    [Op.or]: [{ username: username }, { email: email }],
                }
            });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(password, 10); // Hash the users password
                
                try {
                    // Create the users account
                    let newUserAcct = await UserAccount.create({ 
                        username: username, 
                        email: email, 
                        password_hash: hashedPassword
                    }); 

                    const token = crypto.randomBytes(32).toString("hex"); // Generate a verification token for the user

                    try {
                        // Save the token in the DB with expiry
                        await VerificationToken.create({
                            user_id: newUserAcct.id,
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

                    return res.status(200).json({ message: "User registered successfully", email: newUserAcct.email });
                } catch (error) {
                    console.error('Error registering user:', error);
                    return res.status(500).json({ message: "An error occurred while creating your account" });
                }
            } else {
                return res.status(401).json({ message: "Username or email already exists" });
            }
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ message: "An error occurred while creating your account" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default register;