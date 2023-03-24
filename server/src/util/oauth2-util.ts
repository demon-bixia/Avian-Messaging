import EnvVars from '@src/declarations/major/EnvVars';
import { OAuth2Client } from 'google-auth-library';


// **** Variables **** //

const client = new OAuth2Client(
  EnvVars.oauth2.clientId,
  EnvVars.oauth2.clientSecret
);


// **** Functions **** //

/**
 * Verify the id_token, and access the claims.
 * 
 * @param idToken
 * @returns ticket
 */
async function decode(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: EnvVars.oauth2.clientId,
  });

  return ticket;
}


// **** Export default **** //

export default {
  decode
} as const;
