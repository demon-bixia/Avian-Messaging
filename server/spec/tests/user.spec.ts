import app from '@src/server';
import request from 'supertest';

import authSupport from '@spec/support/auth-support';
import userSupport from '@spec/support/user-support';
import EnvVars from '@src/declarations/major/EnvVars';
import User, { IUser } from '@src/models/user-model';


// **** Types **** //

interface CreateUserInput {
  email: string
  firstName: string
  lastName: string
  password: string
}

interface UpdateUserInput {
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
}


// **** Variables **** //

const CreateUserInput = {
  email: 'test@user.com',
  firstName: 'test',
  lastName: 'test',
  password: 'password'
};

const UpdateUserInput = { firstName: 'new name' }

const url = EnvVars.graphql.url;

// **** Queries **** //

const createUserMutation = (user: CreateUserInput) => ({
  query: 'mutation CreateUser($user: CreateUserInput!) { createUser(user: $user) { email } }',
  variables: { user }
})

const getUserByEmailQuery = (email: string) => ({
  query: 'query GetUserByEmail($email: String!) { getUserByEmail(email:$email) { firstName } }',
  variables: { email }
})

const updateUserMutation = (email: string, change: UpdateUserInput) => ({
  query: `mutation MyMutation($email: String!, $change: UpdateUserInput!) 
  { updateUser(email: $email, change: $change) { firstName } }`,
  variables: { email, change }
});

const deleteUserMutation = (email: string) => ({
  query: `mutation DeleteUser($email: String!) { deleteUser(email: $email) { _id } }`,
  variables: { email }
});

const addContactMutation = (contactEmail: string, ownerEmail: string) => ({
  query: `mutation AddContact($contactEmail: String!, $ownerEmail: String!) {
    addContact(contactEmail: $contactEmail, ownerEmail: $ownerEmail)
  }`,
  variables: { contactEmail, ownerEmail }
});

const removeContactMutation = (contactEmail: string, ownerEmail: string) => ({
  query: `mutation RemoveContact($contactEmail: String!, $ownerEmail: String!) {
    removeContact(contactEmail: $contactEmail, ownerEmail: $ownerEmail)
  }`,
  variables: { contactEmail, ownerEmail }
});


// **** Tests **** //

describe('user-schema', () => {
  let testUser: IUser;
  let authToken: string;

  // before the test starts make sure the database is empty
  // create a test user and authenticate
  beforeAll(async () => {
    userSupport.purgeTestUsers();

    testUser = await userSupport.createTestUser();
    authToken = await authSupport.getJwt(testUser);
  });

  // create a user
  it('should create a new user and respond the email of the new user', async () => {
    const response = await request(app).post(url)
      .send(createUserMutation(CreateUserInput));
    expect(response.body.data.createUser.email).toEqual(CreateUserInput.email);
  });

  // get a user
  it('should respond with the firstName of the user associated with the email', async () => {
    const response = await request(app)
      .post(url)
      .set('Authorization', authToken)
      .send(getUserByEmailQuery(testUser.email));
    expect(response.body.data.getUserByEmail.firstName).toEqual(testUser.firstName);
  });

  // update a user
  it('should update a user and respond with that user\'s firstName', async () => {
    const response = await request(app)
      .post(url)
      .set('Authorization', authToken)
      .send(updateUserMutation(testUser.email, UpdateUserInput));
    expect(response.body.data.updateUser.firstName).toEqual(UpdateUserInput.firstName);
  });

  // delete a user
  it('should delete a user and respond with that user\'s id', async () => {
    const response = await request(app)
      .post(url)
      .set('Authorization', authToken)
      .send(deleteUserMutation(testUser.email));
    const deletedUser = await User.findOne({ _id: testUser._id });
    expect(response.body.data.deleteUser._id).toEqual(testUser._id.toString());
    expect(deletedUser).toBeNull();
  });

  // add and remove contacts from a user's contact list.
  it('should respond with a boolean indicating the operation was successful', async () => {
    const testContact = await userSupport.createTestUser();
    // add contact
    let response = await request(app)
      .post(url)
      .set('Authorization', authToken)
      .send(addContactMutation(testContact.email, testUser.email));
    expect(response.body.data.addContact).toBe(true);
    // remove contact
    response = await request(app)
      .post(url)
      .set('Authorization', authToken)
      .send(removeContactMutation(testContact.email, testUser.email));
    expect(response.body.data.removeContact).toBe(true);
  });
});
