import logger from 'jet-logger';
import { createClient, RedisClientType } from 'redis';
import EnvVars from '@src/declarations/major/EnvVars';


// **** Variables **** //

export let redisClient: RedisClientType;


// **** Functions **** //

/**
 * starts a connection with redis store
 * @returns Promise<RedisClientType>
 */
async function connect() {
    redisClient = createClient({ url: EnvVars.redis.connectionString });

    redisClient.on('error', err => logger.err('Connection to redis failed with error:', err));
    redisClient.on('ready', () => logger.info('Successfully connected to redis'));

    await redisClient.connect();

    return redisClient;
}

/**
 * ends the connection with the redis store
 * @returns Promise<void>
 */
async function disconnect() {
    await redisClient.disconnect();
}


// **** Export default **** //

export default {
    connect,
    disconnect
} as const;