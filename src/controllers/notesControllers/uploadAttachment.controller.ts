import { Request, Response } from 'express';
import Joi from 'joi';
import { Notes } from '../../models';
import { uploadSingleFile } from '../../services/uploadAttachmentHelpers';
import { validate as isUUID } from "uuid";

/**
 * Data Transfer Object for the request body schema.
 */
interface ReqBodySchemaDTO {
    /** The note object in the form of a string */
    note: string;
}

/**
 * Data Transfer Object for the note data schema.
 */
interface NoteDataDTO {
    /** The ID of the note */
    noteID: string;

    /** The title of the note */
    title: string;

    /** The content of the note */
    content: string;

    /** Whether the note is pinned or not */
    isPinned: boolean;

    /** The ID of the background theme color */
    bgThemeID: number;

    /** The ID of the background wallpaper */
    wallpaperID: number;
}

// The request body schema
const reqBodySchema = Joi.object<ReqBodySchemaDTO>({
    note: Joi.string().required()
});

// The note data schema
const noteDataSchema = Joi.object<NoteDataDTO>({
    noteID: Joi.string().uuid().required(),
    title: Joi.string().required().trim(),
    content: Joi.string().required().trim(),
    isPinned: Joi.boolean().required(),
    bgThemeID: Joi.number().required(),
    wallpaperID: Joi.number().required()
});

/**
 * This controller allows the users to attach files to a note.
 */
const uploadAttachment = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const reqBody = reqBodySchema.validate(req.body, { abortEarly: false }); // Validate the req body

    // Check if no errors occurred during validation 
    if (!reqBody.error){
        let noteString = reqBody.value.note; // Get the note string from the request body
        
        try {
            let noteJson = JSON.parse(noteString); // Parse the note string into json

            // Check if the noteJson is a valid JSON object
            if (noteJson !== null && typeof noteJson === "object" && !Array.isArray(noteJson)){
                const noteData = noteDataSchema.validate(noteJson, { abortEarly: false }); // Validate the noteJson

                // Check if no errors occurred during noteJson validation 
                if (!noteData.error){
                    // Check if the note that the user wants to attach files to exists in the DB
                    const getNote = await Notes.findOne({
                        where: {
                            note_id: noteData.value.noteID,
                            user_id: user.id
                        }
                    })

                    if (getNote){
                        /* 
                            If the note already exists, then just update 
                            the note with the values that the user provided.
                        */
                        getNote.title = noteData.value.title;
                        getNote.content = noteData.value.content;
                        getNote.pinned = noteData.value.isPinned;
                        getNote.bg_color = noteData.value.bgThemeID;
                        getNote.wallpaper = noteData.value.wallpaperID;

                        await getNote.save(); // Save the update

                        // Upload the file to cloudinary and store a record of it in the DB
                        let response = await uploadSingleFile(req, res, user, getNote.note_id);

                        if (response.error) {
                            return res.status(500).json({ message: "An error just occurred while uploading the file", realNoteID: getNote.note_id, tempNoteID: null });
                        } else {
                            return res.status(200).json({ 
                                message: "File uploaded", 
                                realNoteID: getNote.note_id, 
                                tempNoteID: null, 
                                attachment: { 
                                    url: response.url, 
                                    public_id: response.public_id, 
                                    mimetype: response.mimetype 
                                }, 
                                accessToken: accessToken ? accessToken : null 
                            });
                        }
                    } else {
                        /*
                            If the note does not exist, then create it.
                        */
                        const newNote = await Notes.create({
                            user_id: user.id,
                            title: noteData.value.title,
                            content: noteData.value.content,
                            is_draft: true,
                            pinned: noteData.value.isPinned,
                            bg_color: noteData.value.bgThemeID,
                            wallpaper: noteData.value.wallpaperID
                        });

                        const tempNoteID = noteData.value.noteID; // Get the temporary ID of the note

                        // Upload the file to cloudinary and store a record of it in the DB
                        let response = await uploadSingleFile(req, res, user, newNote.note_id);

                        if (response.error) {
                            return res.status(500).json({ message: "An error just occurred while uploading the file", realNoteID: newNote.note_id, tempNoteID: tempNoteID });
                        } else {
                            return res.status(200).json({ 
                                message: "File uploaded", 
                                realNoteID: newNote.note_id, 
                                tempNoteID: tempNoteID, 
                                attachment: { 
                                    url: response.url, 
                                    public_id: response.public_id, 
                                    mimetype: response.mimetype 
                                }, 
                                accessToken: accessToken ? accessToken : null 
                            });
                        }
                    }
                } else {
                    return res.status(500).json({ message: "An error just occurred while uploading the file", realNoteID: null, tempNoteID: null }); 
                }
            } else {
                return res.status(500).json({ message: "An error just occurred while uploading the file", realNoteID: null, tempNoteID: null });  
            }
        } catch (error) {
            console.error("Error from upload attachment controller: ", error);
            return res.status(500).json({ message: "An error just occurred while uploading the file", realNoteID: null, tempNoteID: null });    
        }
    } else {
        return res.status(500).json({ message: "An error just occurred while uploading the file", realNoteID: null, tempNoteID: null });
    }
};

export default uploadAttachment;