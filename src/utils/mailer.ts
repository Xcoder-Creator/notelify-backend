import nodemailer from 'nodemailer';
import { EMAIL_PASS, EMAIL_USER } from '../config/env';

/**
 * Nodemailer transporter configuration
 */
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

/**
 * Send an email.
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text body
 * @param html HTML body
 * @returns Promise of the sent email
 */
export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    };
    return transporter.sendMail(mailOptions);
};
