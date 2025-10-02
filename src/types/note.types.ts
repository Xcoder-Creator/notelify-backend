/**
 * Interface for the note attachments.
 */
interface NoteAttachments {
    /** The ID of the attachment */
    attachmentID: number;

    /** The URL of the attachment */
    fileURL: string;

    /** The type of the attachment */
    fileType: string;
}

/**
 * Interface for the Joi updateThemeAndWallpaperSchema.
 */
interface UpdateThemeAndWallpaper {
    /** The IDs of all the selected notes from the client side */
    noteIDs: Array<string>;

    /** The ID of the selected theme or wallpaper */
    id: number;

    /** The update type for all the selected notes, Eg: theme or wallpaper */
    updateType: "theme" | "wallpaper";
}

/**
 * Interface for a note object.
 */
interface Note {
    /** The ID of the note */
    noteID: string;

    /** The ID of the user who created the note */
    userID: number;

    /** The title of the note */
    title: string;

    /** The content of the note in the form of a html string */
    content: string;

    /** Whether the note is synced with the server or not */
    isSynced: boolean;

    /** Whether the note is pinned or not */
    pinned: boolean;

    /** The ID of the background theme for the note if available */
    bgColor: number,
    
    /** The ID of the wallpaper for the note if available */
    wallpaper: number,

    /** The timestamp at which the note was created */
    createdAt: string;

    /** The timestamp at which the note was edited after creation */
    updatedAt: string;

    /** The array of attachments for the note */
    attachments: Array<NoteAttachments>;
}

export type { Note, NoteAttachments, UpdateThemeAndWallpaper };