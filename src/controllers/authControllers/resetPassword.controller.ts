import { Request, Response } from 'express';
import Joi from 'joi';
import { UserAccount } from '../../models/index';
import { ResetPasswordToken } from '../../models/index';
import bcrypt from 'bcrypt';

/**
 * Data Transfer Object for the reset password token.
 */
interface TokenDTO {
    token: string;
}

/**
 * Data Transfer Object for the new password.
 */
interface NewPasswordDTO {
    newPassword: string;
}

// The reset password token schema
const tokenSchema = Joi.object<TokenDTO>({
    token: Joi.string().required().trim()
});

// The new password schema
const newPasswordSchema = Joi.object<NewPasswordDTO>({
    newPassword: Joi.string().min(6).max(15).required().trim()
});

/**
 * Reset password controller.
 */
const resetPassword = async (req: Request, res: Response) => {
    const tokenSchemaResponse = tokenSchema.validate(req.params, { abortEarly: false }); // Validate the reset password token
    const newPasswordSchemaResponse = newPasswordSchema.validate(req.body, { abortEarly: false }); // Validate the users new password

    // If the validation is successful, proceed with the reset password logic
    if (!tokenSchemaResponse.error && !newPasswordSchemaResponse.error) {
        const { token } = tokenSchemaResponse.value; // The sanitized token
        const { newPassword } = newPasswordSchemaResponse.value; // The sanitized new password

        try {
            // Find the reset password token in the database
            const resetPassToken = await ResetPasswordToken.findOne({ 
                where: { 
                    reset_password_token: token 
                } 
            });

            if (resetPassToken) {
                // If the token is found, check if it has expired
                if (new Date() > resetPassToken.expires_at) {
                    return res.status(401).json({ message: "An error occurred while resetting the password" });
                } else {
                    // If the token is valid and not expired, generate a hash for the new password
                    const hashedPassword = await bcrypt.hash(newPassword, 10);

                    try {
                        // Find the user associated with the reset password token
                        const user = await UserAccount.findOne({ where: { id: resetPassToken.user_id } });

                        if (user) {
                            // If the user exists, update their password        
                            user.password_hash = hashedPassword;
                            await user.save();

                            // Delete the reset password token from the database
                            await ResetPasswordToken.destroy({ where: { id: resetPassToken.id } });

                            return res.status(200).json({ message: "Your password has been reset successfully" });
                        } else {
                            // Delete the reset password token from the database
                            await ResetPasswordToken.destroy({ where: { id: resetPassToken.id } });
                            
                            return res.status(401).json({ message: "An error occurred while resetting the password" });
                        }
                    } catch (error) {
                        console.error('Error resetting password:', error);
                        return res.status(500).json({ message: "An error occurred while resetting the password" });
                    }
                }
            } else {
                return res.status(401).json({ message: "An error occurred while resetting the password" });
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json({ message: "An error occurred while resetting the password" });
        }
    } else {
        return res.status(401).json({ message: "This is an invalid request" });
    }
};

export default resetPassword;