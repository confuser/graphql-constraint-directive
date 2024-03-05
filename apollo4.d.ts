import {DocumentNode} from "graphql";
import {ApolloServerPlugin} from '@apollo/server';
import { PluginOptions } from ".";

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
 * @param options to setup plugin.
 */
export function createApollo4QueryValidationPlugin ( options?: PluginOptions ) : ApolloServerPlugin;