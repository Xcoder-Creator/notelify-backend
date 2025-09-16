import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import notesRoutes from './routes/notesRoutes';
import { connectDB } from './config/database';
import { PORT } from './config/env';
import cors from 'cors';

connectDB();

const app = express();

app.use(cors());

app.use(express.json());
app.use(cookieParser());

// For routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});