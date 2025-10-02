import Joi from "joi";
import { NoteAttachments } from "../types/note.types";

// Joi schema for the note attachment object
export const attachmentSchema = Joi.object<NoteAttachments>({
    /** The ID of the attachment */
    attachmentID: Joi.number().required(),

    /** The URL of the attachment */
    fileURL: Joi.string().uri().required(),

    /** The type of the attachment */
    fileType: Joi.string().required()
});