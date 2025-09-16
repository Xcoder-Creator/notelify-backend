import dotenv from 'dotenv';
dotenv.config();

/** The port number of the server */
export const PORT = process.env.PORT || 5000;

/** The database connection URL */
export const DB_URL = process.env.DB_URL;

/** The email address used for sending emails */
export const EMAIL_USER = process.env.EMAIL_USER;

/** The email app password */
export const EMAIL_PASS = process.env.EMAIL_PASS;

/** The API URL */
export const API_URL = process.env.API_URL;

/** The frontend URL */
export const FRONTEND_URL = process.env.FRONTEND_URL;

/** The cloudinary cloud name */
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

/** The cloudinary API key */
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;

/** The cloudinary API secret */
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/** The access token secret */
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/** The refresh token secret */
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;