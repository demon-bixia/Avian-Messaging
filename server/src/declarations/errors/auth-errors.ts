import { GraphQLError } from 'graphql';


// **** Error Messages **** //

const messages = {
  badEmail: 'There is no user registered with this email',
  badPassword: 'The password you entered doesn\'t match with \
  the password of the account registered with the entered email',
  unauthenticated: 'You must be authenticated to query this schema.',
  unauthorized: 'You are not authorized to perform this action.',
  invalidRefresh: 'The refresh token you provided is invalid',
  userDoesNotExist: 'there is no user authenticated'
};


// **** Errors **** //

const BadEmail = new GraphQLError(messages.badEmail, {
  extensions: {
    code: 'BAD_USER_INPUT',
  }
});

const BadPassword = new GraphQLError(messages.badPassword, {
  extensions: {
    code: 'BAD_USER_INPUT',
  }
});

const Unauthenticated = new GraphQLError(messages.unauthenticated, {
  extensions: {
    code: 'UNAUTHENTICATED',
  }
});

const Unauthorized = new GraphQLError(messages.unauthorized, {
  extensions: {
    code: 'UNAUTHORIZED',
  }
});

const InvalidRefresh = new GraphQLError(messages.invalidRefresh, {
  extensions: {
    code: 'BAD_USER_INPUT',
  }
});

const UserDoesNotExist = new GraphQLError(messages.userDoesNotExist, {
  extensions: {
    code: 'UNAUTHENTICATED'
  }
})


// **** Default export **** //

export default {
  messages,
  BadEmail,
  BadPassword,
  Unauthenticated,
  Unauthorized,
  InvalidRefresh,
  UserDoesNotExist
} as const;
