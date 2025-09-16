import { Sequelize } from 'sequelize';
import { DB_URL } from './env';

/**
 * Sequelize instance for database connection.
 */
export const sequelize = new Sequelize(DB_URL as string, {
    dialect: 'postgres',
    logging: false,
});

/**
 * Connect to the PostgreSQL database.
 */
export const connectDB = async () => {
    try {
        // Try connecting to the database
        await sequelize.authenticate(); 
        console.log('Database connected successfully');

        // Sync all models → creates tables if they don’t exist
        await sequelize.sync();

        console.log("✅ All models synced");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};
