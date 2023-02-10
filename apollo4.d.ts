import {DocumentNode, GraphQLSchema} from "graphql";
import {ApolloServerPlugin} from '@apollo/server';

export const constraintDirectiveTypeDefs: string;

export const constraintDirectiveTypeDefsGql: DocumentNode;

export function createApollo4QueryValidationPlugin ( options: { schema: GraphQLSchema } ) : ApolloServerPlugin;