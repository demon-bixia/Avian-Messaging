import { tick } from '@src/declarations/functions';
import jwtUtil from '@src/util/jwt-util';
import pwdUtil from '@src/util/pwd-util';

import User from '@src/models/user-model';

import { EncodedValues } from '@src/declarations/interfaces';

import authErrors from '@src/declarations/errors/auth-errors';


// **** Types **** //

interface Tokens {
  accessToken: string
  refreshToken: string
}


// **** Variables **** //

// Error Messages
export const errorMessages = {
  badEmail: 'There is no user registered with this email',
  badPassword: 'The password you entered doesn\'t match with \
  the password of the account registered with the entered email',
  unauthenticated: 'You must be authenticated to query this schema.',
  unauthorized: 'You are not authorized to perform this action.',
  badRefresh: 'The refresh token you provided is invalid'
};


// **** Functions **** //

/**
 * Authenticates a user using email and password
 * and creates jwt access and refresh tokens.
 */
async function getJwt(email: string, password: string): Promise<Tokens> {
  // Fetch user
  const user = await User.findOne({ email: email });

  if (!user) {
    throw authErrors.BadEmail;
  }

  // Check password
  const hash = (user.password ?? '');
  const pwdPassed = await pwdUtil.compare(password, hash);
  if (!pwdPassed) {
    // If password failed, wait 500ms this will increase security
    await tick(500);

    throw authErrors.BadPassword;
  }

  // create new access and refresh tokens.
  const accessToken = await jwtUtil.sign({ email: user.email, role: user.role });
  const refreshToken = await jwtUtil.sign({ email: user.email, role: user.role }, 'refresh');

  // return the token.
  return { accessToken, refreshToken };
}

/**
 * Verifies the refresh token and return a new access token.
 */
async function refreshJwt(token: string): Promise<Tokens> {
  const decoded = await jwtUtil.decode<EncodedValues>(token, 'refresh');

  if (typeof decoded === 'string') {
    throw authErrors.InvalidRefresh;
  }

  // create new access and refresh tokens.
  const accessToken = await jwtUtil.sign({ email: decoded.email, role: decoded.role });
  const refreshToken = await jwtUtil.sign({ email: decoded.email, role: decoded.role }, 'refresh');

  return { accessToken, refreshToken };
}


// **** Export default **** //

export default {
  getJwt,
  refreshJwt,
  errorMessages
} as const;
