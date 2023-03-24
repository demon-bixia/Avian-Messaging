import { GraphQLError } from 'graphql';


// **** Error Messages **** //

const messages = {
  noChangePermissions: 'You don\'t have rights to change this object.',
  objectDoesNotExist: 'The user object you\'re looking for doesn\'t exist.',
  mutationFailed: 'the mutation operation was unsuccessful',
};


// **** Errors **** //

const NoChangePermissions = new GraphQLError(messages.noChangePermissions, {
  extensions: {
    code: 'UNAUTHORIZED',
  }
});

const ObjectDoesNotExist = new GraphQLError(messages.objectDoesNotExist, {
  extensions: {
    code: 'BAD_USER_INPUT',
  }
});

const MutationFailed = new GraphQLError(messages.mutationFailed, {
  extensions: {
    code: 'BAD_USER_INPUT',
  }
});


// **** Default Export **** //

export default {
  messages,
  NoChangePermissions,
  ObjectDoesNotExist,
  MutationFailed,
} as const;