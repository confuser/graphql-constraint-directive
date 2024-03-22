import type {DocumentNode} from "graphql";
import type {ApolloServerPlugin, BaseContext} from '@apollo/server';
import type {PluginOptions} from '.';

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
export function createApollo4QueryValidationPlugin <TContext extends BaseContext>( options?: PluginOptions ) : ApolloServerPlugin<TContext>;