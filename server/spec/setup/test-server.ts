import logger from 'jet-logger';

import EnvVars from '@src/declarations/major/EnvVars';
import app from '@src/server';

import type { Server } from 'http';
import { RedisClientType } from 'redis';

import db from '@src/connections/db';
import cache from '@src/connections/cache';


// **** Start test server **** //

let server: Server;
let redisClient: RedisClientType;

beforeAll(async () => {
  // connect to database
  await db.connect();

  // connect to cache store
  redisClient = await cache.connect();

  // start http server
  const msg = ('Express server started on port: ' + EnvVars.port);
  server = app.listen(EnvVars.port, () => logger.info(msg));
});


afterAll(async () => {
  // disconnect from db
  await db.disconnect();

  // disconnect from cache store
  await cache.disconnect()

  // Close http server
  server.close();
});