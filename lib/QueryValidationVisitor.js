const { getVariableValues } = require('graphql/execution/values.js')
const {
  Kind,
  getNamedType,
  isInputObjectType,
  BREAK
} = require('graphql')
const { getDirective } = require('@graphql-tools/utils')
const ValidationError = require('./error')
const { getConstraintValidateFn, getScalarType } = require('./typeutils')

const DEBUG = false
const DEBUG2 = false

function logDebug (message, msg2) {
  if (DEBUG) console.log('\n' + message + (DEBUG2 && msg2 ? msg2 : ''))
}

module.exports = class QueryValidationVisitor {
  constructor (context, options) {
    this.context = context
    this.options = options

    this.constraintDirectiveDef = this.context.getSchema().getDirective('constraint')
    this.variableValues = {}

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter
    }

    this.SelectionSet = {
      enter: this.onSelectionSetEnter,
      leave: this.onSelectionSetLeave
    }

    this.Field = {
      enter: this.onFieldEnter
    }

    this.Argument = {
      enter: this.onArgumentEnter
    }

    this.InlineFragment = {
      enter: this.onInlineFragmentEnter,
      leave: this.onInlineFragmentLeave
    }

    this.FragmentSpread = {
      enter: this.onFragmentSpreadEnter,
      leave: this.onFragmentSpreadLeave
    }
  };

  onOperationDefinitionEnter (operation) {
    logDebug('onOperationDefinitionEnter: ', JSON.stringify(operation, null, 2))

    // preparation work before we start to traverse Query tree and other onXX() methods are called

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
    // logDebug('variableValues: ', JSON.stringify(this.variableValues))

    // prepare basic this.currentTypeInfo based on the operation
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
    // no parent set as we are at the top of tree
    this.currentTypeInfo = { typeDef }
  }

  onSelectionSetEnter (node) {
    logDebug('onSelectionSetEnter: ', JSON.stringify(node))
    // update this.currentTypeInfo as we traverse down the query tree. No this.currentField present means that we are starting at the top of tree and the info is already set from the onOperationDefinitionEnter()
    if (this.currentField) {
      const field = this.currentTypeInfo.typeDef.getFields()[this.currentField.name.value]
      if (field) {
        const newTypeDef = getNamedType(field.type)
        this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef }
      } else {
        logDebug('onSelectionSetEnter is part of the Introspection query')
        return BREAK
      }
    }
  }

  onSelectionSetLeave (node) {
    logDebug('onSelectionSetLeave: ', JSON.stringify(node))
    // update this.currentTypeInfo to traverse back/up the the tree
    this.currentTypeInfo = this.currentTypeInfo.parent
  }

  onFieldEnter (node) {
    logDebug('onFieldEnter: ', JSON.stringify(node))
    // logDebug('onFieldEnter is inside of object ', JSON.stringify(this.currentTypeInfo.typeDef))

    // prepere current field info, so onArgumentEnter() can use it
    this.currentField = node
    this.currentrFieldDef = this.currentTypeInfo.typeDef.getFields()[node.name.value]
  }

  onArgumentEnter (arg) {
    // logDebug('onArgumentEnter: ', JSON.stringify(arg))

    // look for directive and validate argument if directive found
    const argTypeDef = this.currentrFieldDef.args.find(d => d.name === arg.name.value)
    logDebug('onArgumentEnter argTypeDef: ', JSON.stringify(argTypeDef))
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
          error = new ValidationError(argName, `Argument "${arg.name.value}" of "${this.currentField.name.value}" got invalid value ${value}. ` + e.message, e.context)
        }
        error.originalError = e
        this.context.reportError(error)
      }
    }
    if (isInputObjectType(argTypeDef.type)) {
      // TODO validate InputType argument fields direct
      // TODO validate InputType argument fields from variable
    }
    // TODO meaningful error message, in case of variable name, in case of argument name etc
  }

  onInlineFragmentEnter (node) {
    logDebug('onInlineFragmentEnter: ', JSON.stringify(node))

    throw new Error('INLINE_FRAGMENT validation not implemented yet')
  }

  onInlineFragmentLeave (node) {
    logDebug('onInlineFragmentLeave: ', JSON.stringify(node))
  }

  onFragmentSpreadEnter (node) {
    logDebug('onFragmentSpreadEnter: ', JSON.stringify(node))

    throw new Error('FRAGMENT_SPREAD validation not implemented yet')
  }

  onFragmentSpreadLeave (node) {
    logDebug('onFragmentSpreadLeave: ', JSON.stringify(node))
  }
}
