import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/env';
import { RefreshToken } from '../models';

/**
 * Middleware to perform authentication for protected routes.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 */
export const authentication = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; // Get the authorization header
    const refreshToken = req.cookies?.refreshToken; // Get the refresh token from cookies

    // Check if the auth header is present
    if (authHeader) {
        // If it is, extract the access token from it
        const accessToken = authHeader.split(' ')[1];

        try {
            // Verify the access token
            const user: any = jwt.verify(accessToken, ACCESS_TOKEN_SECRET as string);

            // Attach user and access token to req
            (req as any).user = user;
            (req as any).accessToken = null;

            return next();
        } catch (error) {
            if (!refreshToken) {
                return res.status(401).json({ message: 'Unauthorized request', isLoggedIn: false });
            }
            
            try {
                const validateRefreshToken = async () => {
                    // Check if the refresh token exists in the database
                    const checkRefreshToken = await RefreshToken.findOne({
                        where: {
                            refresh_token: refreshToken
                        }
                    });

                    if (checkRefreshToken){
                        // Verify the refresh token
                        const user: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as string);

                        // Generate a new access token
                        const newAccessToken = jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });

                        // Attach user and new access token to req
                        (req as any).user = user;
                        (req as any).accessToken = newAccessToken;
                        
                        return next();
                    } else {
                        return res.status(401).json({ message: 'Unauthorized request', isLoggedIn: false });        
                    }
                }

                validateRefreshToken();
            } catch (error) {
                return res.status(401).json({ message: 'Unauthorized request', isLoggedIn: false });
            }
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized request', isLoggedIn: false });
    }
};