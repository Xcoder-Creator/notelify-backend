import { Request, Response } from 'express';
import { Notes } from '../../models/notes.model';
import Joi from 'joi';
import { Attachments } from '../../models';

/**
 * Data Transfer Object for the finalized note.
 */
interface FinalizedNoteDTO {
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

// The finalized note schema
const finalizedNoteSchema = Joi.object<FinalizedNoteDTO>({
    noteID: Joi.string().uuid().required(),
    title: Joi.string().required().trim(),
    content: Joi.string().required().trim(),
    isPinned: Joi.boolean().required(),
    bgThemeID: Joi.number().required(),
    wallpaperID: Joi.number().required()
});

/**
 * This controller allows the users to finalize a note that they have created.
 */
const finalizeNote = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const { error, value } = finalizedNoteSchema.validate(req.body, { abortEarly: false }); // Validate the finalized note details

    // If the validation is successful, proceed with the finalize note logic
    if (!error) {
        const { noteID, title, content, isPinned, bgThemeID, wallpaperID } = value; // The sanitized versions of the finalized note details    

        try {
            // Check if the note that the user is creating already exists in the DB
            const getNote = await Notes.findOne({
                where: {
                    note_id: noteID,
                    user_id: user.id
                }
            })

            if (getNote){
                /* 
                    If the note already exists, then just update 
                    the note with the values that the user provided.
                */
                getNote.title = title;
                getNote.content = content;
                getNote.pinned = isPinned;
                getNote.bg_color = bgThemeID;
                getNote.wallpaper = wallpaperID;
                getNote.is_draft = false;

                await getNote.save(); // Save the update

                // Fetch the note along with its attachments
                const noteWithAttachments = await Notes.findOne({
                    where: { 
                        note_id: noteID,
                        user_id: user.id
                    },
                    include: [
                        {
                            model: Attachments,
                            as: "attachments",
                            attributes: ["id", "file_url", "file_type"],
                            separate: true
                        },
                    ]
                });

                return res.status(200).json({ message: "Note finalized", noteID: getNote.note_id, note: noteWithAttachments, accessToken: accessToken ? accessToken : null });
            } else {
                /*
                    If the note does not exist, then create it.
                */
                const newNote = await Notes.create({
                    user_id: user.id,
                    title: title,
                    content: content,
                    is_draft: false,
                    pinned: isPinned,
                    bg_color: bgThemeID,
                    wallpaper: wallpaperID
                });

                // Fetch the note along with its attachments
                const noteWithAttachments = await Notes.findOne({
                    where: { 
                        note_id: newNote.note_id,
                        user_id: user.id
                    },
                    include: [
                        {
                            model: Attachments,
                            as: "attachments",
                            attributes: ["id", "file_url", "file_type"],
                            separate: true
                        },
                    ]
                });

                return res.status(200).json({ message: "Note finalized", noteID: noteID, note: noteWithAttachments, accessToken: accessToken ? accessToken : null });
            }
        } catch (error) {
            console.error("Error from finalize note controller: ", error);
            return res.status(500).json({ message: "An error just occurred, please try again later" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default finalizeNote;