import User, { IUser } from "@src/models/user-model";
import jwtUtil from "@src/util/jwt-util";


// **** Functions **** //

/**
 * authenticate a user.
 */
async function getJwt(user: IUser) {
  // create token
  const token = await jwtUtil.sign({
    email: user.email,
    role: user.role,
  });

  return token;
}


// **** Export default **** //

export default {
  getJwt,
} as const;
