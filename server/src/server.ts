import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import 'express-async-errors';

import { NodeEnvs } from '@src/declarations/enums';
import EnvVars from '@src/declarations/major/EnvVars';

import graphqlMiddleware from '@src/graphql/middleware';


// **** Init express **** //

const app = express();


// **** Set basic express settings **** //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.cookieProps.secret));

// Show routes called in console during development
if (EnvVars.nodeEnv === NodeEnvs.Dev) {
    app.use(morgan('dev'));
}

// Security
if (EnvVars.nodeEnv === NodeEnvs.Production) {
    app.use(helmet());
}

// **** Graphql **** //

// setup graphql server middleware
app.use(EnvVars.graphql.url, graphqlMiddleware);


// **** Export default **** //

export default app;
