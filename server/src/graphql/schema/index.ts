import { merge } from 'lodash';

import authDirective from '@src/graphql/directives/auth-directive';

import { resolvers as AuthResolvers, typeDef as AuthTypeDefs } from '@src/graphql/schema/auth-schema';
import { resolvers as UserResolvers, typeDef as UserTypeDefs } from '@src/graphql/schema/user-schema';

import type { IContext } from '@src/graphql/context';
import { constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { createSchema } from 'graphql-yoga';


// **** Variables **** //

export const typeDefs = [
    constraintDirectiveTypeDefs,
    authDirective.typeDefs,
    UserTypeDefs,
    AuthTypeDefs
];

export const resolvers = merge(UserResolvers, AuthResolvers);

const directiveTransformers = [
    authDirective.directive('auth').authDirectiveTransformer,
];

let schema: any = createSchema<IContext>({ typeDefs, resolvers });

schema = directiveTransformers.reduce((curSchema, transformer) => transformer(curSchema), schema);


// **** Export default **** //

export default schema;
