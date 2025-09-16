import { Request, Response } from 'express';
import { UserAccount } from '../../models';

/**
 * The user authentication controller.
 */
const userAuth = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this

    try {
        // Check if the user exists based on their ID and email
        const getUserAccount = await UserAccount.findOne({
            where: {
                id: user.id,
                email: user.email
            }
        });

        if (getUserAccount){
            if (getUserAccount.is_verified){
                // The users data
                const userData = {
                    userID: getUserAccount.id,
                    email: getUserAccount.email,
                    username: getUserAccount.username,
                    profileImage: null,
                    verified: getUserAccount.is_verified,
                    accessToken: accessToken ? accessToken : null
                }

                return res.status(200).json({ message: "User authenticated successfully", userData: userData, isLoggedIn: true });
            } else {
                return res.status(401).json({ message: "User is not verified", isLoggedIn: false });
            }
        } else {
            return res.status(404).json({ message: "User does not exist", isLoggedIn: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error just occurred", isLoggedIn: true });
    }
};

export default userAuth;