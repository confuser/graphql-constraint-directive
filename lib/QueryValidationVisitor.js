const { getVariableValues } = require('graphql/execution/values.js')
const {
  Kind,
  isInputObjectType
} = require('graphql')
const { getDirective } = require('@graphql-tools/utils')
const ValidationError = require('./error')
const { getConstraintValidateFn, getScalarType } = require('./typeutils')

module.exports = class QueryValidationVisitor {
  constructor (context, options) {
    this.context = context
    this.options = options

    this.constraintDirectiveDef = this.context.getSchema().getDirective('constraint')
    this.variableValues = {}

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter
    }
  };

  onOperationDefinitionEnter (operation) {
    // console.log('onOperationDefinitionEnter: ' + JSON.stringify(operation, null, 2))
    if (typeof this.options.operationName === 'string' && this.options.operationName !== operation.name.value) {
      return
    }
    // Get variable values from variables that are passed from options, merged with default values defined in the operation
    this.variableValues = getVariableValues(
      this.context.getSchema(),
      // We have to create a new array here because input argument is not readonly in graphql ~14.6.0
      operation.variableDefinitions ? [...operation.variableDefinitions] : [],
      this.options.variables ?? {}
    ).coerced
    // console.log('variableValues: ' + JSON.stringify(this.variableValues))
    let typeDef
    switch (operation.operation) {
      case 'query':
        typeDef = this.context.getSchema().getQueryType()
        break
      case 'mutation':
        typeDef = this.context.getSchema().getMutationType()
        break
      case 'subscription':
        typeDef = this.context.getSchema().getSubscriptionType()
        break
      default:
        throw new Error(
          `Query validation could not be performed for operation of type ${operation.operation}`
        )
    }
    this.processQueryNode(operation, typeDef)
  }

  processQueryNode (node, typeDef) {
    if (node.selectionSet) {
      const fields = typeDef.getFields()
      // console.log('node fields: ' + JSON.stringify(fields, null, 2))
      node.selectionSet.selections.forEach(childNode => {
        switch (childNode.kind) {
          case Kind.FIELD: {
            if (childNode.arguments) {
              childNode.arguments.forEach(arg => {
                const argTypeDef = fields[childNode.name.value].args.find(d => d.name === arg.name.value)
                // console.log('argTypeDef: ' + JSON.stringify(argTypeDef, null, 2))
                const directiveArgumentMap = getDirective(this.context.getSchema(), argTypeDef, 'constraint')?.[0]
                if (directiveArgumentMap) {
                  const argName = argTypeDef.astNode.name.value
                  let value
                  if (arg.value.kind === Kind.VARIABLE) {
                    value = this.variableValues[arg.name.value]
                  } else {
                    value = arg.value.value
                  }
                  try {
                    getConstraintValidateFn(getScalarType(argTypeDef.type).scalarType)(argName, directiveArgumentMap, value)
                  } catch (e) {
                    let error

                    if (arg.value.kind === Kind.VARIABLE) {
                      error = new ValidationError(argName, `Variable "$${arg.value.name.value}" got invalid value ${value}. ` + e.message, e.context)
                    } else {
                      error = new ValidationError(argName, `Argument "${arg.name.value}" of "${childNode.name.value}" got invalid value ${value}. ` + e.message, e.context)
                    }
                    error.originalError = e
                    this.context.reportError(error)
                  }
                }
                if (isInputObjectType(argTypeDef.type)) {
                  // TODO validate InputType argument fields direct
                  // TODO validate InputType argument fields from variable
                }
                // TODO meaningful error message, in case of variable name it, in case of argument name it etc
              })
            }
            // TODO validate whole tree structure - validate returned types
            break
          }
          case Kind.FRAGMENT_SPREAD: {
            // TODO query FRAGMENT_SPREAD support if necessary?
            throw new Error('FRAGMENT_SPREAD validation not implemented')
          }
          case Kind.INLINE_FRAGMENT: {
            // TODO query INLINE_FRAGMENT support if necessary?
            throw new Error('INLINE_FRAGMENT validation not implemented')
          }
          default : {
            throw new Error(childNode.kind + ' validation not implemented')
          }
        }
      })
    }
  }
}
