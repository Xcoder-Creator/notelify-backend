import { Request, Response } from "express";
import path from 'path';
import cloudinary from "../config/cloudinary";
import { v4 as uuidv4 } from "uuid";
import { Attachments } from "../models";

interface UploadSingleFileResponse {
    /** Whether error occurred or not */
    error: boolean;

    /** The URL of the attachment */
    url: string | null;

    /** The attachments public ID */
    public_id: string | null;

    /** The attachments mimetype */
    mimetype: string | null;
}

/**
 * This allows the user to upload a single file to cloudinary.
 * @param req - Request object from express
 * @param res - Response object from express
 */
export const uploadSingleFile = async (req: Request, res: Response, user: any, note_id: string): Promise<UploadSingleFileResponse> => {
    try {
        // Check if the file was not uploaded
        if (!req.file) {
            return { error: true, url: null, public_id: null, mimetype: null };
        }

        const ext = path.extname(req.file.originalname); // Extract the extention from the file name
        const uniqueId = uuidv4(); // Generate a unique ID that will be used as the uploaded file name

        // Perform the upload
        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: "notes_attachments",
                    public_id: `file_${uniqueId}${ext}`,
                    use_filename: false,
                    unique_filename: false,
                    resource_type: "raw"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(req.file?.buffer); // Upload file buffer to Cloudinary
        });

        // Once uploaded, create the attachment record
        await Attachments.create({
            user_id: user.id,
            note_id: note_id,
            file_url: result.secure_url,
            file_type: req.file.mimetype,
            public_id: result.public_id
        });

        return { error: false, url: result.secure_url, public_id: result.public_id, mimetype: req.file.mimetype };
    } catch (error) {
        console.error(error)
        return { error: true, url: null, public_id: null, mimetype: null };
    }
}