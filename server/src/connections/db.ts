import EnvVars from '@src/declarations/major/EnvVars';
import logger from 'jet-logger';
import mongoose from 'mongoose';


/**
 * Connect to mongodb
 * @returns Promise<void>
 */
async function connect() {
    mongoose.set('strictQuery', false);

    await mongoose.connect(EnvVars.mongo.connectionString, {}, error => {
        if (error) {
            logger.err('Connection to mongodb failed with error:');
            throw error;
        } else {
            logger.info("Successfully connected to mongodb.");
        }
    });
}

/**
 * ends connection with mongodb 
 * @returns Promise<void>
 */
async function disconnect() {
    await mongoose.disconnect();
}


// **** Export default **** //

export default {
    connect,
    disconnect
} as const;