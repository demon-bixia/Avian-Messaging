import * as argon2 from "argon2";


// **** Functions **** //

/**
 * Get a hash from the password.
 */
async function getHash(pwd: string): Promise<string> {
  const hash = await argon2.hash(pwd);
  return hash;
}


/**
 * See if a password passes the hash.
 */
async function compare(pwd: string, hash: string): Promise<boolean> {
  const passes = await argon2.verify(hash, pwd);
  return passes;
}


// **** Export Default **** //

export default {
  getHash,
  compare,
} as const;