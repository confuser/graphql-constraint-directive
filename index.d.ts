import {GraphQLSchema, GraphQLError, DocumentNode, ValidationContext} from "graphql";
import {OperationDefinitionNode, FragmentDefinitionNode, InlineFragmentNode, FieldNode, ArgumentNode} from 'graphql/language';
import {PluginDefinition} from "apollo-server-core";

export class QueryValidationVisitor {
    onOperationDefinitionEnter (operation: OperationDefinitionNode): void;
    onFragmentEnter (node: FragmentDefinitionNode | InlineFragmentNode): void;
    onFragmentLeave (node: FragmentDefinitionNode | InlineFragmentNode): void;
    onFieldEnter (node: FieldNode): void;
    onFieldLeave (node: FieldNode): void;
    onArgumentEnter (arg: ArgumentNode): void;
}

/**
 * Schema transformer which adds custom types performing validations based on the @constraint directives.
 */
export function constraintDirective () : (schema: GraphQLSchema) => GraphQLSchema;

interface DocumentationOptions {
    /** Header for the constraints documentation block in the field or argument description */
    header?: string;
    /** Names for distinct constraint types */
    descriptionsMap?: {
        minLength: string,
        maxLength: string,
        startsWith: string,
        endsWith: string,
        contains: string,
        notContains: string,
        pattern: string,
        format: string,
        min: string,
        max: string,
        exclusiveMin: string,
        exclusiveMax: string,
        multipleOf: string,
        minItems: string,
        maxItems: string
    };
}

/**
 * Schema transformer which adds @constraint directives documentation to the fields and arguments descriptions.
 * Documentation not added if it already exists (`header` is present in the field or argument description)
 * 
 * @param options options to customize the documentation process
 */
export function constraintDirectiveDocumentation (options: DocumentationOptions) : (schema: GraphQLSchema) => GraphQLSchema;

/**
 * Type definition for @constraint directive.
 */
export const constraintDirectiveTypeDefs: string

/**
 * Method for query validation based on the @constraint directives defined in the schema.
 * 
 * @param schema GraphQL schema to look for directives
 * @param query GraphQL query to validate
 * @param variables used in the query to validate
 * @param operationName optional name of the GraphQL operation to validate
 */
export function validateQuery () : (schema: GraphQLSchema, query: DocumentNode, variables: Record<string, any>, operationName?: string) => Array<GraphQLError>;

/**
 * Create Apollo 3 plugin performing query validation.
 */
export function createApolloQueryValidationPlugin ( options: { schema: GraphQLSchema } ) : PluginDefinition;

/**
 * Create JS GraphQL Validation Rule performing query validation.
 */
export function createQueryValidationRule( options: { [key: string]: any }) : (context: ValidationContext) => QueryValidationVisitor;

/**
 * Create Envelop plugin performing query validation.
 */
export function createEnvelopQueryValidationPlugin() : object;
