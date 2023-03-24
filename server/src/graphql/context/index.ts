import { IUser } from '@src/models/user-model';
import type { Request } from 'express';
import getUser from './get-user';


// **** Types **** //

export interface IContext {
  token: string
  user: IUser | null
  getUser: () => Promise<IUser>
}


// **** Functions **** //

/**
 * Builds the http request context
 * @returns context
 **/
async function context({ req }: { req: Request }): Promise<IContext> {
  // get the user access token from the headers
  const token = req.headers.authorization || '';

  let user: IUser | null = null; // used to cache the user

  // add the token to the context
  return {
    token,
    user,
    getUser: async () => (!user ? await getUser(token) : user)
  };
}


// **** Export default **** //

export default context;
