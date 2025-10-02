import Joi from "joi";
import { Note } from "../types/note.types";
import { attachmentSchema } from "./attachmentSchema";

/** Joi schema for the note object */
export const noteSchema = Joi.object<Note>({
    /** The ID of the note */
    noteID: Joi.string().required(),

    /** The ID of the user who created the note */
    userID: Joi.number().required(),

    /** The title of the note (can be empty, but not both empty with content) */
    title: Joi.string().allow("").optional(),

    /** The content of the note (can be empty, but not both empty with title) */
    content: Joi.string().allow("").optional(),

    /** Whether the note is synced with the server or not */
    isSynced: Joi.boolean().required(),

    /** Whether the note is pinned or not */
    pinned: Joi.boolean().required(),

    /** The ID of the background theme for the note if available */
    bgColor: Joi.number().optional(),

    /** The ID of the wallpaper for the note if available */
    wallpaper: Joi.number().optional(),

    /** The timestamp at which the note was created */
    createdAt: Joi.string().isoDate().required(),

    /** The timestamp at which the note was last updated */
    updatedAt: Joi.string().isoDate().required(),

    /** The array of attachments for the note */
    attachments: Joi.array().items(attachmentSchema).default([])
})
    // Require at least one of title, content, or attachments
    .or("title", "content", "attachments")
    // Extra custom validation for the Google Keep rule
    .custom((value, helpers) => {
        const isTitleEmpty = !value.title || value.title.trim() === "";
        const isContentEmpty = !value.content || value.content.trim() === "";
        const hasAttachments = Array.isArray(value.attachments) && value.attachments.length > 0;

        if (isTitleEmpty && isContentEmpty && !hasAttachments) {
            return helpers.error("any.invalid", {
                message: "If title and content are empty, attachments must be provided.",
            });
        }

        return value;
    }, "Custom rule");