import { Router } from 'express';
import fetchNotes from '../controllers/notesControllers/fetchNotes.controller';
import { authentication } from '../middleware/auth';
import createOrUpdateNote from '../controllers/notesControllers/createOrUpdateNote.controller';
import uploadAttachment from '../controllers/notesControllers/uploadAttachment.controller';
import { upload } from '../config/multer';
import { handleMulterErrors } from '../middleware/handleMulterErrors';
import finalizeNote from '../controllers/notesControllers/finalizeNote.controller';
import deleteAttachment from '../controllers/notesControllers/deleteAttachment.controller';
import updateThemeAndWallpaper from '../controllers/notesControllers/updateThemeAndWallpaper.controller';

/* 
    This is the notes route where all the endpoints for
    managing user notes are grouped together.
*/

const router = Router();

router.post('/fetch-notes', authentication, fetchNotes); // For fetching notes
router.post('/create-or-update-note', authentication, createOrUpdateNote); // For creating/updating notes
router.post('/update-theme-and-wallpaper', authentication, updateThemeAndWallpaper); // For updating the theme and wallpaper of the notes
router.post(
    '/upload-attachment', 
    authentication, 
    handleMulterErrors(upload.single("file")), // Multer + safe error handling for multiple files
    uploadAttachment
); // For uploading attachments
router.post('/finalize-note', authentication, finalizeNote); // For finalizing notes
router.post('/delete-attachment', authentication, deleteAttachment); // For deleting attachments

export default router;