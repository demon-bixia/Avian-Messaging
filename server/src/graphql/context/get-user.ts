import { EncodedValues } from '@src/declarations/interfaces';
import User, { IUser } from '@src/models/user-model';

import jwtUtil from '@src/util/jwt-util';
import oauth2Util from '@src/util/oauth2-util';

import authErrors from '@src/declarations/errors/auth-errors';


// **** Functions **** //

/**
 * 
 * @param token
 * @returns user
 */
async function getUser(token: string): Promise<IUser> {
  let user: IUser | null = null;

  // using sever issued jwt
  const decoded = await jwtUtil.decode<EncodedValues>(token);

  if (typeof decoded !== 'string') {
    user = await User.findOne({ email: decoded.email });
  }

  if (!user) {
    // using google oauth2
    const ticket = await oauth2Util.decode(token);
    const payload = await ticket.getPayload();

    if (payload) {
      user = await User.findOne({ email: payload.email });
    }
  }

  // return the user
  if (user) {
    return user;
  }

  // if the user not found throw an error
  throw authErrors.UserDoesNotExist;
}


// **** Export default **** //

export default getUser;