import {GraphQLSchema, GraphQLError, DocumentNode, ValidationContext} from "graphql";
import QueryValidationVisitor from "./lib/QueryValidationVisitor";

export function constraintDirective () : (schema: GraphQLSchema) => GraphQLSchema;

export const constraintDirectiveTypeDefs: string

export function validateQuery () : (schema: GraphQLSchema, query: DocumentNode, variables: Record<string, any>, operationName?: string) => Array<GraphQLError>;

export function createApolloQueryValidationPlugin () : (schema: GraphQLSchema) => function;

export function createQueryValidationRule( options: { [key: string]: any }) : (context: ValidationContext) => QueryValidationVisitor;
