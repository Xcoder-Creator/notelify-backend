import { Request, Response } from 'express';
import Joi from 'joi';
import { ResetPasswordToken } from '../../models/index';

/**
 * Data Transfer Object for check reset token.
 */
interface CheckResetTokenDTO {
    token: string;
}

// The check reset token schema
const checkResetTokenSchema = Joi.object<CheckResetTokenDTO>({
    token: Joi.string().required().trim()
});

/**
 * Check reset token controller.
 */
const checkResetToken = async (req: Request, res: Response) => {
    const { error, value } = checkResetTokenSchema.validate(req.params, { abortEarly: false }); // Validate the users email

    // If the validation is successful, proceed with the verification logic
    if (!error) {
        const { token } = value; // The sanitized token

        try {
            // Find the reset password token in the database
            const resetToken = await ResetPasswordToken.findOne({ 
                where: { 
                    reset_password_token: token 
                } 
            });

            if (resetToken) {
                // If the token is found, check if it has expired
                if (new Date() > resetToken.expires_at) {
                    return res.status(401).json({ message: "This reset password token has expired" });
                }

                return res.status(200).json({ message: "Valid reset password token" });
            } else {
                // If the reset token is not found, it is invalid
                return res.status(404).json({ message: "Invalid reset password token" });
            }
        } catch (error) {
            console.error('Error checking reset password token:', error);
            return res.status(500).json({ message: "An error just occurred" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default checkResetToken;