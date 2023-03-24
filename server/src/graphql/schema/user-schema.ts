import userService from "@src/services/user-service";
import type { IContext } from "../context";


// **** Type Definitions **** //

export const typeDef = `#graphql
    # enums
    enum UserRoles {
        Standard 
        Admin
    }

    # object types
    type User {
        _id: ID
        email: String @constraint(format: "email", maxLength: 255)
        firstName: String @constraint(maxLength: 50, minLength: 3)
        lastName: String @constraint(maxLength: 50, minLength: 3)
        avatar: String
        contacts: [Contact]!
        lastSeen: String
        password: String @auth(requires: Admin)
        role: UserRoles
    }

    type Contact {
        _id: ID
        email: String @constraint(format: "email", maxLength: 255)
        firstName: String @constraint(maxLength: 50, minLength: 3)
        lastName: String @constraint(maxLength: 50, minLength: 3)
        avatar: String
        lastSeen: String
    }

    # input types
    input CreateUserInput {
        email: String! @constraint(format: "email", maxLength: 255)
        firstName: String! @constraint(maxLength: 50, minLength: 3)
        lastName: String! @constraint(maxLength: 50, minLength: 3)
        avatar: String
        password: String! @constraint(maxLength: 80, minLength: 8)
    }

    input UpdateUserInput {
        firstName: String @constraint(maxLength: 50, minLength: 3)
        lastName: String @constraint(maxLength: 50, minLength: 3)
        avatar: String
    }

    # query types
    type Query {
        getUserByEmail(email: String): User! @auth(requires: Standard)
    }

    # mutation type
    type Mutation {
        createUser(user: CreateUserInput!): User!
        updateUser(email: String!, change: UpdateUserInput!): User! @auth(requires: Standard)
        deleteUser(email: String!): User! @auth(requires: Standard)
        addContact(ownerEmail: String!, contactEmail: String!): Boolean! @auth(requires: Standard)
        removeContact(ownerEmail: String!, contactEmail: String!): Boolean! @auth(requires: Standard)
    }
`;


// **** Resolvers **** //

export const resolvers = {
  Query: {
    /*
     * Gets a single user using email field 
     */
    getUserByEmail: async (_parent: any, args: any) => {
      const user = await userService.getByEmail(args.email);
      return user;
    },
  },

  Mutation: {
    /*
     * Adds one user
     */
    async createUser(_parent: any, args: any) {
      const user = await userService.create(args.user);
      return user;
    },

    /*
     * Updates one user
     */
    async updateUser(_parent: any, args: any, context: IContext) {
      const user = await userService.update(args.email, args.change, context);
      return user;
    },

    /*
     * Deletes one user.
     */
    async deleteUser(_parent: any, args: any, context: IContext) {
      const user = await userService.delete(args.email, context);
      return user;
    },

    /**
     * Adds contact to the authenticated user's contacts list 
     */
    async addContact(_parent: any, args: any, context: IContext) {
      const successful = await userService.addContact(args.ownerEmail, args.contactEmail, context);
      return successful;
    },

    /**
     * Removes contact from the authenticated user's contacts list 
     */
    async removeContact(_parent: any, args: any, context: IContext) {
      const successful = await userService.removeContact(args.ownerEmail, args.contactEmail, context);
      return successful;
    }
  }
};
