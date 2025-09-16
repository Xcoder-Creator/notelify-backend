import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

/**
 * Wraps a Multer middleware to handle errors safely in TypeScript
 */
export const handleMulterErrors = (multerMiddleware: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        multerMiddleware(req, res, (err: unknown) => {
            if (err instanceof MulterError) {
                // Multer-specific errors (use the message directly to avoid TS issues)
                return res.status(400).json({ message: err.message });
            } else if (err) {
                // Unknown errors
                return res.status(400).json({ message: "Upload failed", error: err });
            }

            // No errors → proceed to your controller
            next();
        });
    };
};