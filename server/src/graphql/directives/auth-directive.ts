import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

import authErrors from '@src/declarations/errors/auth-errors';
import type { EncodedValues } from '@src/declarations/interfaces';
import { TokenPayload } from 'google-auth-library';
import User, { IUser } from '@src/models/user-model';

import jwtUtil from '@src/util/jwt-util';
import oauth2Util from '@src/util/oauth2-util';


import logger from 'jet-logger';



// **** Variables **** /

export const typeDefs = `
    # directives
    directive @auth(requires: UserRoles = Standard) on OBJECT | FIELD_DEFINITION
`;


// **** Functions **** //

/**
 * checks if the user is authenticated with jwt and is
 * authorized.
 * 
 * @param token
 * @param required
 */
async function jwtCheck(token: string, requires: string = 'Standard') {
  let authenticated = false;
  let authorized = false;

  try {
    const decoded = await jwtUtil.decode<EncodedValues>(token);
    // check if the user is authenticated with jwt
    if (typeof decoded !== 'string' && decoded.email) {
      authenticated = true;
      // check if the user is authorized
      if (decoded.role === 'Admin' || decoded.role === requires) {
        authorized = true;
      }
    }
  } catch (error) {
    /* 
      for some reason graphql throws an error
      when promises are rejected in this scope.
   */
    logger.err(error.message);
  }

  return {
    authenticated,
    authorized
  }
}

/**
 * checks if the user is authenticated with oauth2 and is
 * authorized.
 *  
 * @param token
 * @param required
 */
async function oauth2Check(token: string, requires: string = 'Standard') {
  let authenticated = false;
  let authorized = false;

  let user: IUser | null = null;
  let payload: TokenPayload | undefined;

  try {
    // check if the user is authenticated with oauth2
    const ticket = await oauth2Util.decode(token);
    payload = await ticket.getPayload();
    if (payload && payload.email) {
      authenticated = true;
    }
  } catch (error) {
    /* 
      for some reason graphql throws an error
      when promises are rejected in this scope.
    */
    logger.err(error);
  }

  if (authenticated) {
    // grab the user form the database to check for role
    user = await User.findOne({ email: (payload as TokenPayload).email });
    // check if there is a user associated with the the email
    if (!user) {
      throw authErrors.BadEmail;
    }
    // check if the user is authorized
    if (user.role === 'Admin' || user.role === requires) {
      authorized = true;
    }
  }

  // set the in context

  return {
    authenticated,
    authorized
  }
}

/**
 * A schema directive that blocks unauthenticated and unauthorized access.
 */
function directive(directiveName: string) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};

  return {
    authDirectiveTypeDefs: `directive @${directiveName}(
            requires: UserRoles = Standard,
            ) on OBJECT | FIELD_DEFINITION

            enum UserRoles {
                Standard
                Admin
            }
        `,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },

        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0] ?? typeDirectiveArgumentMaps[typeName];

          if (authDirective) {
            const { requires } = authDirective;

            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig;

              fieldConfig.resolve = async (source, args, context, info) => {

                // see if the user is authenticated with jwt.
                let { authenticated, authorized } = await jwtCheck(context.token, requires);

                // if the user is not authenticated with jwt try authenticating 
                // the user with oauth12.
                if (!authenticated) {
                  ({ authenticated, authorized } = await oauth2Check(context.token, requires));
                }

                // if the user is not authenticated using any method
                // throw an unauthenticated error.
                if (!authenticated) {
                  throw authErrors.Unauthenticated
                }

                // if the user doesn't have sufficent permision to carry out the 
                // graphql operation throw an unauthorized.
                if (!authorized) {
                  throw authErrors.Unauthorized;
                }

                return resolve(source, args, context, info);
              }
              return fieldConfig;
            }
          }
        }
      })
  }
}


// **** Export default **** //

export default {
  directive,
  typeDefs,
} as const;