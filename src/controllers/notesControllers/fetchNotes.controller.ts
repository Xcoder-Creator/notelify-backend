import { Request, Response } from 'express';
import { Notes } from '../../models/index';
import Joi from 'joi';
import { Attachments } from '../../models/index';

/**
 * Data Transfer Object for user fetching notes.
 */
interface FetchNotesDTO {
    pinnedPage: number;
    othersPage: number;
    pageSize: number;
}

// The fetch notes schema
const fetchNotesSchema = Joi.object<FetchNotesDTO>({
    pinnedPage: Joi.number().required(),
    othersPage: Joi.number().required(),
    pageSize: Joi.number().required()
});

/**
 * This controller is used to fetch all the users notes.
 */
const fetchNotes = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const { error, value } = fetchNotesSchema.validate(req.body, { abortEarly: false }); // Validate the users fetch notes details

    // If the validation is successful, proceed with the fetch notes logic
    if (!error) {
        const { pinnedPage, othersPage, pageSize } = value; // The sanitized versions of the users fetch notes details

        try {
            // Fetch the users notes that are not drafts and pinned
            const pinnedNotesWithAttachments = await Notes.findAll({
                where: { 
                    user_id: user.id,
                    is_draft: false,
                    pinned: true
                },
                include: [
                    {
                        model: Attachments,
                        as: "attachments",
                        attributes: ["id", "file_url", "file_type"],
                        separate: true
                    },
                ],
                limit: pageSize,
                offset: (pinnedPage - 1) * pageSize,
                order: [["created_at", "DESC"]],
            });

            // Fetch the users notes that are not drafts and unpinned
            const unpinnedNotesWithAttachments = await Notes.findAll({
                where: { 
                    user_id: user.id,
                    is_draft: false,
                    pinned: false
                },
                include: [
                    {
                        model: Attachments,
                        as: "attachments",
                        attributes: ["id", "file_url", "file_type"],
                        separate: true
                    },
                ],
                limit: pageSize,
                offset: (othersPage - 1) * pageSize,
                order: [["created_at", "DESC"]],
            });

            return res.status(200).json({ 
                message: "Notes fetched successfully", 
                data: { 
                    pinnedNotes: pinnedNotesWithAttachments, 
                    unpinnedNotes: unpinnedNotesWithAttachments, 
                    pinnedPage: pinnedNotesWithAttachments.length > 0 ? pinnedPage + 1 : pinnedPage, 
                    othersPage: unpinnedNotesWithAttachments.length > 0 ? othersPage + 1 : othersPage 
                }, 
                accessToken: accessToken ? accessToken : null 
            });
        } catch (error) {
            console.error("Error from fetch notes controller: ", error);
            return res.status(500).json({ message: "An error just occurred, please try again later" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default fetchNotes;