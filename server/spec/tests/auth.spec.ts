import authSupport from '@spec/support/auth-support';
import userSupport from '@spec/support/user-support';
import authErrors from '@src/declarations/errors/auth-errors';

import { IUser } from '@src/models/user-model';

import EnvVars from '@src/declarations/major/EnvVars';
import app from '@src/server';
import request from 'supertest';


// **** Variables **** //

const url = EnvVars.graphql.url;

const { messages } = authErrors;


// **** Queries **** //

const getJwtMutation = (email: string, password: string) => ({
  query: `mutation GetJwt($email: String!, $password: String!) {
    getJwt(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }`,
  variables: { email, password }
});

const getUsersPasswordByEmailQuery = (email: string) => ({
  query: 'query GetUserByEmail($email: String!) { getUserByEmail(email:$email) { password} }',
  variables: { email: email }
})

const getUsersNameByEmailQuery = (email: string) => ({
  query: 'query GetUserByEmail($email: String!) { getUserByEmail(email:$email) { lastName } }',
  variables: { email: email }
})


// **** Tests **** //

describe('auth-schema', () => {
  let testUser: IUser;
  let authToken: string;

  // before the tests make sure the database is empty
  // and create a new test user
  beforeAll(async () => {
    await userSupport.purgeTestUsers();
    testUser = await userSupport.createTestUser();
    authToken = await authSupport.getJwt(testUser);
  });

  // good login.
  it('should respond with a token.', async () => {
    const response = await request(app)
      .post(url)
      .send(getJwtMutation(testUser.email, 'password'));
    expect(response.body.data.getJwt.accessToken).not.toBeNull();
    // update auth token for other tests
    authToken = response.body.data.getJwt.accessToken;
  });

  // email not found error.
  it(`should respond with '${messages.badEmail}'`, async () => {
    const response = await request(app)
      .post(url)
      .send(getJwtMutation('bad@test.com', 'password'));
    expect(response.body.errors[0].message).toEqual(messages.badEmail);
  });

  // password failed.
  it(`should respond with '${messages.badPassword}'`, async () => {
    const response = await request(app)
      .post(url)
      .send(getJwtMutation(testUser.email, 'badpassword'));
    expect(response.body.errors[0].message).toEqual(messages.badPassword);
  });

  // execute query with being authenticated.
  it(`should respond with '${messages.unauthenticated}'`, async () => {
    const response = await request(app)
      .post(url)
      .send(getUsersPasswordByEmailQuery(testUser.email));
    expect(response.body.errors[0].message).toEqual(messages.unauthenticated);
  });

  // execute query without having the required permissions.
  it(`should respond with '${messages.unauthorized}'`, async () => {
    const response = await request(app)
      .post(url)
      .set('Authorization', authToken)
      .send(getUsersPasswordByEmailQuery(testUser.email));
    expect(response.body.errors[0].message).toEqual(messages.unauthorized);
  });

  // execute a query google openid connect token
  it('should respond with the firstName of the user', async () => {
    // create a user with the email associated with the id_token
    const testUser = await userSupport.createTestUser({
      email: 'mohslahmed1000@gmail.com',
    });

    // get a new id_token from: https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%2Copenid%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&url=https%3A%2F%2Fwww.googleapis.com%2Foauth2%2Fv2%2Fuserinfo&content_type=application%2Fjson&http_method=GET&useDefaultOauthCred=checked&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A%2F%2Faccounts.google.com%2Fo%2Foauth2%2Fv2%2Fauth&oauthTokenEndpointValue=https%3A%2F%2Foauth2.googleapis.com%2Ftoken&oauthClientId=386405760011-d11opg7epcl0hsj9s0cljoltk0cj6ev1.apps.googleusercontent.com&oauthClientSecret=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&postData=%7B%0A%20%20%22query%22%3A%20%22query%20GetUserInfo%20%7B%20getUserByEmail(email%3A%20%22ms%40email.com%22)%20%7B%20email%20firstName%20lastName%20%7D%7D%22%0A%7D&includeCredentials=checked&accessTokenType=bearer&autoRefreshToken=unchecked&accessType=offline&prompt=consent&response_type=code&wrapLines=on
    const idToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5NjJlN2EwNTljN2Y1YzBjMGQ1NmNiYWQ1MWZlNjRjZWVjYTY3YzYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzODY0MDU3NjAwMTEtZDExb3BnN2VwY2wwaHNqOXMwY2xqb2x0azBjajZldjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzODY0MDU3NjAwMTEtZDExb3BnN2VwY2wwaHNqOXMwY2xqb2x0azBjajZldjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTM4NDY0NDM0MDQzODM5NDk0MDkiLCJlbWFpbCI6Im1vaHNsYWhtZWQxMDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiNHo5bnZwOVkzakNTVkM5Z0dndUwxUSIsIm5hbWUiOiJtdWhhbW1hZCBzYWxhaCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BRWRGVHA1UXhUQkxPempITWhJVXdlVjlfTWs1RTdjb09kc1NfRFpZOW8zMnpnPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Im11aGFtbWFkIiwiZmFtaWx5X25hbWUiOiJzYWxhaCIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjc3MDAwOTAwLCJleHAiOjE2NzcwMDQ1MDB9.PAG0Zs6eeNmal7f_Nb294D2p3VEWntl3AuVHxmekLLsunh6ZcpVoVNR_nnWA7iLQroxvNX3oqCEKomZRr1BgQF-cfu3HKoimikATwPNqtsP2jJomp8sFMfpzXqvum8Eq84wBZqmuT-Ttk8m1nQkegdpUFAsSQU_cOXRbKB5JzpW025tR6ceY0Zra-kSXCE2ygWlWHbaoOvHoPihvVKwhU0KKVOIg8Og_sQF3Pk2c7TE7g2-ycrAnU4og-8e_K5TYU47j90N5-Ghp4Id6X45T5OcJbKhFIRTGHUofgofpQqBExifvtzgu0hWaaD2XlT7iNjXeTz1cFE_6sN3fDbfLWA";

    const response = await request(app)
      .post(url)
      .set('Authorization', idToken)
      .send(getUsersNameByEmailQuery(testUser.email));
    expect(response.body.data.getUserByEmail.lastName).toEqual(testUser.lastName);
  })
});
