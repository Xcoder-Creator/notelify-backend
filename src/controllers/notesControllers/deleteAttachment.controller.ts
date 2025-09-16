import { Request, Response } from 'express';
import Joi from 'joi';
import { Attachments } from '../../models';
import cloudinary from '../../config/cloudinary';

/**
 * Data Transfer Object for deleting an attachment from a note.
 */
interface DeleteAttachmentDTO {
    /** The ID of the note */
    noteID: string;

    /** The ID of the attachment */
    attachmentID: number;
}

// The delete attachment schema
const deleteAttachmentSchema = Joi.object<DeleteAttachmentDTO>({
    noteID: Joi.string().uuid().required(),
    attachmentID: Joi.number().required()
});

/**
 * This controller allows the users to delete an attachment from a note.
 */
const deleteAttachment = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const { error, value } = deleteAttachmentSchema.validate(req.body, { abortEarly: false }); // Validate the users delete attachment details

    // If the validation is successful, proceed with the delete attachment logic
    if (!error) {
        const { noteID, attachmentID } = value; // The sanitized versions of the delete attachment details    

        try {
            // Check if the attachment exists in the DB
            const getAttachment = await Attachments.findOne({
                where: {
                    id: attachmentID,
                    user_id: user.id,
                    note_id: noteID
                }
            })

            if (getAttachment){
                let attachmentPublicID = getAttachment.public_id; // The cloudinary public ID of the attachment

                /* 
                    If the attachment exists, then just delete 
                    the attachment from the note.
                */
                await getAttachment.destroy();

                // Delete the attachment from cloudinary as well
                await cloudinary.uploader.destroy(attachmentPublicID, {
                    resource_type: "raw",
                });

                return res.status(200).json({ message: "Attachment deleted", attachmentID: attachmentID, accessToken: accessToken ? accessToken : null });
            } else {
                return res.status(200).json({ message: "Attachment deleted", attachmentID: attachmentID, accessToken: accessToken ? accessToken : null });
            }
        } catch (error) {
            console.error("Error from delete attachment controller: ", error);
            return res.status(500).json({ message: "An error just occurred, please try again later" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default deleteAttachment;