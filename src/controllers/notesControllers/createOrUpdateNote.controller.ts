import { Request, Response } from 'express';
import { Notes } from '../../models/notes.model';
import { Attachments } from '../../models';
import { noteSchema } from '../../utils/noteSchema';

/**
 * This controller allows the users to create a new note or update an existing note.
 */
const createOrUpdateNote = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const { error, value } = noteSchema.validate(req.body, { abortEarly: false }); // Validate the users note details

    // If the validation is successful, proceed with the create note logic
    if (!error) {
        const { noteID, userID, title, content, isSynced, pinned, bgColor, wallpaper, createdAt, updatedAt, attachments } = value; // The sanitized versions of the properties from the note object    

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
                getNote.pinned = pinned;
                getNote.bg_color = bgColor;
                getNote.wallpaper = wallpaper;

                await getNote.save(); // Save the update

                // Get the note along sides its attachments
                const getNoteWithAttachments = await Notes.findOne({
                    where: { 
                        note_id: noteID,
                        user_id: user.id
                    },
                    attributes: [
                        ['note_id', 'noteID'],
                        ['user_id', 'userID'],
                        'title',
                        'content',
                        ['is_synced', 'isSynced'],
                        'pinned',
                        ['bg_color', 'bgColor'],
                        'wallpaper',
                        ['created_at', 'createdAt'],
                        ['updated_at', 'updatedAt']
                    ],
                    include: [
                        {
                            model: Attachments,
                            as: "attachments",
                            attributes: [
                                ["id", "attachmentID"], 
                                ["file_url", "fileURL"], 
                                ["file_type", "fileType"]
                            ],
                            separate: true
                        },
                    ]
                });

                return res.status(200).json({ message: "Note updated", state: "updated", noteID: getNote.note_id, note: getNoteWithAttachments, accessToken: accessToken ? accessToken : null });
            } else {
                // If the note does not exist, then create it
                const newNote = await Notes.create({
                    user_id: user.id,
                    title: title,
                    content: content,
                    is_synced: true,
                    pinned: pinned,
                    bg_color: bgColor,
                    wallpaper: wallpaper
                });

                // The crafted note object for the new note
                const craftedNoteObject = {
                    noteID: newNote.note_id,
                    userID: newNote.user_id,
                    title: newNote.title,
                    content: newNote.content,
                    isSynced: newNote.is_synced,
                    pinned: newNote.pinned,
                    bgColor: newNote.bg_color,
                    wallpaper: newNote.wallpaper,
                    createdAt: newNote.created_at,
                    updatedAt: newNote.updated_at,
                    attachments: []
                }

                return res.status(200).json({ message: "Note created", state: "created", realNoteID: newNote.note_id, tempNoteID: noteID, note: craftedNoteObject, accessToken: accessToken ? accessToken : null });
            }
        } catch (error) {
            console.error("Error from create or update note controller: ", error);
            return res.status(500).json({ message: "An error just occurred, please try again later" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default createOrUpdateNote;