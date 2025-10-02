import { Request, Response } from 'express';
import { Notes } from '../../models/notes.model';
import { updateThemeAndWallpaperSchema } from '../../utils/updateThemeAndWallpaperSchema';
import { Op } from 'sequelize';

/**
 * This controller allows the users to update the 
 * background theme and wallpaper of an existing note.
 */
const updateThemeAndWallpaper = async (req: Request, res: Response) => {
    const user = (req as any).user; // middleware sets this
    const accessToken = (req as any).accessToken; // middleware sets this
    const { error, value } = updateThemeAndWallpaperSchema.validate(req.body, { abortEarly: false }); // Validate the users note details

    // If the validation is successful, proceed with the theme and wallpaper update logic
    if (!error) {
        const { noteIDs, id, updateType } = value; // The sanitized versions of the properties from the UpdateThemeAndWallpaper object interface    

        try {
            if (updateType === "theme"){
                /* 
                    Update the background color/theme 
                    of all the selected notes
                */
                await Notes.update(
                    { bg_color: id },
                    {
                        where: {
                            note_id: { [Op.in]: noteIDs }
                        }
                    }
                );

                return res.status(200).json({ message: "Updated the theme of all selected notes", accessToken: accessToken ? accessToken : null });
            } else if (updateType === "wallpaper"){
                /* 
                    Update the wallpaper
                    of all the selected notes
                */
                await Notes.update(
                    { wallpaper: id },
                    {
                        where: {
                            note_id: { [Op.in]: noteIDs }
                        }
                    }
                );

                return res.status(200).json({ message: "Updated the wallpaper of all selected notes", accessToken: accessToken ? accessToken : null });
            }
        } catch (error) {
            console.error("Error from update theme and wallpaper controller: ", error);
            return res.status(500).json({ message: "An error just occurred, please try again later" });
        }
    } else {
        return res.status(401).json({ message: error.details[0].message });
    }
};

export default updateThemeAndWallpaper;