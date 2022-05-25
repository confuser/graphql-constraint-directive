import {GraphQLSchema, GraphQLError, DocumentNode} from "graphql";

export function constraintDirective () : (schema: GraphQLSchema) => GraphQLSchema;

export const constraintDirectiveTypeDefs: string

export function validateQuery () : (schema: GraphQLSchema, query: DocumentNode, variables: Record<string, any>, operationName?: string) => Array<GraphQLError>;

export function createApolloQueryValidationPlugin () : (schema: GraphQLSchema) => function;
