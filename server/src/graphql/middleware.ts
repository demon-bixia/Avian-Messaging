import context from '@src/graphql/context';
import { createYoga } from 'graphql-yoga';

import { createEnvelopQueryValidationPlugin } from 'graphql-constraint-directive';

import schema from '@src/graphql/schema';
import EnvVars from '@src/declarations/major/EnvVars';


// **** Variables **** //

export let yoga: any;


// **** Functions **** //

/**
 * Configures a graphql server.
 * 
 * @param app
 */
function createGraphqlMiddleware() {
    // create a new yoga instance
    yoga = createYoga({
        schema,
        context,
        plugins: [createEnvelopQueryValidationPlugin(),],
        cors: {
            origin: EnvVars.cors.origin,
            credentials: true,
            methods: ['POST'],
        },
        landingPage: false,
    });
    return yoga;
}


// **** Export default **** //

export default createGraphqlMiddleware();
