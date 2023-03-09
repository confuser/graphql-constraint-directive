import {DocumentNode, GraphQLSchema} from "graphql";
import {ApolloServerPlugin} from '@apollo/server';

/**
 * Constraint directive typeDef as a `string`
 */
export const constraintDirectiveTypeDefs: string;

/**
 * Constraint directive typeDef as a `DocumentNode`
 */
export const constraintDirectiveTypeDefsGql: DocumentNode;

/**
 * Create Apollo 4 validation plugin.
 * 
 * @param options to setup plugin. `schema` is deprecated now, not used, as plugins gets schema from the Apollo Server.
 */
export function createApollo4QueryValidationPlugin ( options: { schema?: GraphQLSchema } ) : ApolloServerPlugin;