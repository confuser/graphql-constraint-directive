import {GraphQLSchema} from "graphql";

export function constraintDirective () : (schema: GraphQLSchema) => GraphQLSchema;

export const constraintDirectiveTypeDefs: string
