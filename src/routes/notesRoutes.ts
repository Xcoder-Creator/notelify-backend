import { Router } from 'express';
import fetchNotes from '../controllers/notesControllers/fetchNotes.controller';
import { authentication } from '../middleware/auth';
import createNote from '../controllers/notesControllers/createNote.controller';
import uploadAttachment from '../controllers/notesControllers/uploadAttachment.controller';
import { upload } from '../config/multer';
import { handleMulterErrors } from '../middleware/handleMulterErrors';
import finalizeNote from '../controllers/notesControllers/finalizeNote.controller';
import deleteAttachment from '../controllers/notesControllers/deleteAttachment.controller';

/* 
    This is the notes route where all the endpoints for
    managing user notes are grouped together.
*/

const router = Router();

router.post('/fetch-notes', authentication, fetchNotes); // For fetching notes
router.post('/create-note', authentication, createNote); // For creating notes
router.post(
    '/upload-attachment', 
    authentication, 
    handleMulterErrors(upload.single("file")), // Multer + safe error handling for multiple files
    uploadAttachment
); // For uploading attachments
router.post('/finalize-note', authentication, finalizeNote); // For finalizing notes
router.post('/delete-attachment', authentication, deleteAttachment); // For deleting attachments

export default router;