import User from "@src/models/user-model";
import userService from "@src/services/user-service";
import { getRandomInt } from "@src/declarations/functions";
import { merge } from "lodash";


// **** Types **** //

interface CreateTestUserInput {
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
  password?: string
}


// **** Functions **** //

/**
 * Create a user for testing.
 */
async function createTestUser(input: CreateTestUserInput = {}) {
  const DefaultCreateTestUserInput = {
    email: `user${getRandomInt()}@test.com`,
    firstName: 'test',
    lastName: 'test',
    avatar: 'https://images.unsplash.com/photo-1675139380320-6ba6a0f6f8b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    password: 'password'
  };

  let user = merge(DefaultCreateTestUserInput, input);

  const testUser = await userService.create(user);

  return testUser;
}

/**
 * Delete all users.
 */
async function purgeTestUsers() {
  await User.deleteMany({});
}


// **** Export default **** //

export default {
  createTestUser,
  purgeTestUsers
} as const;
