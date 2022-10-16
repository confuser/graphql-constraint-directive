import {GraphQLSchema, GraphQLError, DocumentNode, ValidationContext} from "graphql";
import {PluginDefinition} from "apollo-server-core";
import QueryValidationVisitor from "./lib/query-validation-visitor";

export function constraintDirective () : (schema: GraphQLSchema) => GraphQLSchema;

export const constraintDirectiveTypeDefs: string

export function validateQuery () : (schema: GraphQLSchema, query: DocumentNode, variables: Record<string, any>, operationName?: string) => Array<GraphQLError>;

export function createApolloQueryValidationPlugin ( options: { schema: GraphQLSchema } ) : PluginDefinition;

export function createQueryValidationRule( options: { [key: string]: any }) : (context: ValidationContext) => QueryValidationVisitor;

export function createEnvelopQueryValidationPlugin() : object;
