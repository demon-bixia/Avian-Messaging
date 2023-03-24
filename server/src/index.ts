import '@src/pre-start'; // Must be the first import
import logger from 'jet-logger';

import EnvVars from '@src/declarations/major/EnvVars';
import app from '@src/server';

import db from '@src/connections/db';
import cache from '@src/connections/cache';


// **** Start Application **** //

// Connect to database
db.connect();

// Connect to cache store
cache.connect();

// Start the http server
const msg = ('Express server started on port: ' + EnvVars.port);
const server = app.listen(EnvVars.port, () => logger.info(msg));


// **** Default Export Server **** //

export default server;