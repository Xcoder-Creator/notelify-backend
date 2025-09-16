import { Request, Response } from 'express';
import { Notes } from '../../models/notes.model';
import Joi from 'joi';

/**
 * Data Transfer Object for creating a new note.
 */
interface CreateNoteDTO {
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

// The create note schema
const createNoteSchema = Joi.object<CreateNoteDTO>({
    noteID: Joi.string().uuid().required(),
    title: Joi.string().required().trim(),
    content: Joi.string().required().trim(),
    isPinned: Joi.boolean().required(),
    bgThemeID: Joi.number().required(),
    wallpaperID: Joi.number().required()
});

/**
 * This controller allows the users to create new notes.
 */
const createNote = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const { error, value } = createNoteSchema.validate(req.body, { abortEarly: false }); // Validate the users note details

    // If the validation is successful, proceed with the create note logic
    if (!error) {
        const { noteID, title, content, isPinned, bgThemeID, wallpaperID } = value; // The sanitized versions of the create note details    

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

                await getNote.save(); // Save the update

                return res.status(201).json({ message: "Note updated", noteID: getNote.note_id, accessToken: accessToken ? accessToken : null });
            } else {
                /*
                    If the note does not exist, then create it.
                */
                const newNote = await Notes.create({
                    user_id: user.id,
                    title: title,
                    content: content,
                    is_draft: true,
                    pinned: isPinned,
                    bg_color: bgThemeID,
                    wallpaper: wallpaperID
                })

                return res.status(200).json({ message: "Note created", realNoteID: newNote.note_id, tempNoteID: noteID, accessToken: accessToken ? accessToken : null });
            }
        } catch (error) {
            console.error("Error from create note controller: ", error);
            return res.status(500).json({ message: "An error just occurred, please try again later" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default createNote;