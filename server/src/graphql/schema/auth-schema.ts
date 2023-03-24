import authService from "@src/services/auth-service";


// **** Type Definitions **** //

// type definition
export const typeDef = `#graphql
    # object types
    type Tokens {
        accessToken: String!
        refreshToken: String!
    }

    # mutation type
    extend type Mutation {
        getJwt(email: String!, password: String!): Tokens!
        refreshJwt(refreshToken: String!): Tokens!
    }
`;


// **** Resolvers **** //

export const resolvers = {
    Mutation: {
        /**
         * Authenticates a user and returns token
         */
        async getJwt(_parent: any, args: any) {
            const tokens = await authService.getJwt(args.email, args.password);
            return tokens;
        },

        /**
         * Authenticates a user and returns token
         */
        async refreshJwt(_parent: any, args: any) {
            const tokens = await authService.refreshJwt(args.refreshToken);
            return tokens;
        }
    }
};