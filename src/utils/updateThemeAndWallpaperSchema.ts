import Joi from "joi";
import { UpdateThemeAndWallpaper } from "../types/note.types";

/** Joi schema for the updateThemeAndWallpaperSchema controller request body */
export const updateThemeAndWallpaperSchema = Joi.object<UpdateThemeAndWallpaper>({
    /** The IDs of all the selected notes from the client side */
    noteIDs: Joi.array().items(Joi.string().required()).min(1).required(),

    /** The ID of the selected theme or wallpaper */
    id: Joi.number().required(),

    /** The update type for all the selected notes, Eg: theme or wallpaper */
    updateType: Joi.string().valid("theme", "wallpaper").required()
});