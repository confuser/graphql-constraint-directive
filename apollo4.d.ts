import {GraphQLSchema} from "graphql";
import {ApolloServerPlugin} from '@apollo/server';

export const constraintDirectiveTypeDefs: string

export function createApollo4QueryValidationPlugin ( options: { schema: GraphQLSchema } ) : ApolloServerPlugin;