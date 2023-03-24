import userErrors from '@src/declarations/errors/user-errors';
import type { IContext } from '@src/graphql/context';
import User, { IUser } from '@src/models/user-model';
import pwdUtil from '@src/util/pwd-util';


// **** Types **** //

export interface CreateUserInput {
  email: string
  firstName: string
  lastName: string
  avatar: string
  password: string
}

export interface UpdateUserInput {
  firstName: string
  lastName: string
  avatar: string
  contacts: string[]
}


// **** Functions **** //

/**
 * Checks if the user has access to the object
 * @param id 
 * @returns 
 */
function checkObjectPermission(authenticatedUser: IUser, user: IUser) {
  // check that the user has permissions to edit the object
  if (authenticatedUser.role !== 'Admin' && authenticatedUser.email !== user.email) {
    throw userErrors.NoChangePermissions;
  }
}

/**
 * Get one user using email.
 */
async function getByEmail(email: string): Promise<IUser> {
  const result = await User.aggregate<IUser>([
    { $match: { email } },
    {
      $lookup: {
        from: "users",
        localField: "contacts",
        foreignField: "email",
        as: "contacts",
        pipeline: [{ $unset: "contacts" }]
      }
    }
  ]);
  const user = result[0];

  // check that the object exists
  if (!user) {
    throw userErrors.ObjectDoesNotExist;
  }

  // Return user
  return user;
}

/**
 * Add one user.
 */
async function create(user: CreateUserInput): Promise<IUser> {
  user.password = await pwdUtil.getHash(user.password); // hash the password
  const newUser = new User(user);

  await newUser.save();

  // Return user
  return newUser;
}

/**
 * Update one user using email.
 */
async function update(email: string, change: UpdateUserInput, context: IContext): Promise<IUser | null> {
  const user = await getByEmail(email);
  const authenticatedUser = await context.getUser();
  checkObjectPermission(authenticatedUser, <IUser>user);

  // update the user object
  const result = await User.updateOne({ email }, change, { runValidators: true });

  // check that the update was successful
  if (result.modifiedCount === 0) {
    throw userErrors.MutationFailed;
  }

  const updatedUser = await getByEmail(email);

  // Return the updated user
  return updatedUser;
}

/**
 * Delete a user by their email.
 */
async function _delete(email: string, context: IContext): Promise<IUser | null> {
  const user = await getByEmail(email);
  const authenticatedUser = await context.getUser();
  checkObjectPermission(authenticatedUser, <IUser>user);

  // Delete user
  const result = await User.deleteOne({ email });

  // check deletion is successful
  if (result.deletedCount === 0) {
    throw userErrors.MutationFailed;
  }

  // Return user
  return user;
}

/**
 * Add contact to a user's contact list.
 * @param contactEmail: of the contact you want to add 
 * @returns boolean: indicates operation success
 */
async function addContact(ownerEmail: string, contactEmail: string, context: IContext) {
  await getByEmail(contactEmail); // check that the contact exists

  // check that the authenticated user has the right  
  // to update the object.
  const owner = await getByEmail(ownerEmail);
  const authenticatedUser = await context.getUser();
  checkObjectPermission(authenticatedUser, owner);

  // append the user
  const result = await User.updateOne(
    { email: owner.email },
    { $addToSet: { contacts: contactEmail } }
  );

  // check if addition is successful
  if (result.modifiedCount === 0) {
    throw userErrors.MutationFailed;
  }

  return true;
}

/**
 * Remove contact from a user's contact list.
 * @param email: of the contact you want to remove 
 * @returns boolean: indicates operation success
 */
async function removeContact(ownerEmail: string, contactEmail: string, context: IContext) {
  await getByEmail(contactEmail); // check that the contact exists

  // check that the authenticated user has the right  
  // to update the object.
  const owner = await getByEmail(ownerEmail);
  const authenticatedUser = await context.getUser();
  checkObjectPermission(authenticatedUser, owner);

  // remove the user
  const result = await User.updateOne(
    { email: ownerEmail },
    { $pull: { contacts: contactEmail } }
  );

  // check if removal is successful
  if (result.modifiedCount === 0) {
    throw userErrors.MutationFailed;
  }

  return true;
}


// **** Export default **** //

export default {
  getByEmail,
  create,
  update,
  delete: _delete,
  addContact,
  removeContact,
} as const;
