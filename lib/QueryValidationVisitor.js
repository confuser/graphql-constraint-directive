const { getVariableValues } = require('graphql/execution/values.js')
const {
  GraphQLString,
  Kind,
  getNamedType,
  isInputObjectType,
  isListType,
  isNonNullType,
  BREAK,
  valueFromAST,
  typeFromAST,
  visit
} = require('graphql')
const { getDirective } = require('@graphql-tools/utils')
const ValidationError = require('./error')
const { getConstraintValidateFn, getScalarType } = require('./typeutils')

const DEBUG = true
const DEBUG2 = true

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
      enter: this.onFieldEnter,
      leave: this.onFieldLeave
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
    // logDebug('onOperationDefinitionEnter: ', JSON.stringify(operation, null, 2))

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

  onInlineFragmentEnter (node) {
    const newTypeDef = typeFromAST(this.context.getSchema(), node.typeCondition)
    this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef }
  }

  onInlineFragmentLeave (node) {
    this.currentTypeInfo = this.currentTypeInfo.parent
  }

  onFragmentSpreadEnter (node) {
    logDebug('onFragmentSpreadEnter: ', JSON.stringify(node))

    throw new Error('FRAGMENT_SPREAD validation not implemented yet')
  }

  onFragmentSpreadLeave (node) {
    logDebug('onFragmentSpreadLeave: ', JSON.stringify(node))
  }

  onSelectionSetEnter (node) {
  }

  onSelectionSetLeave (node) {
  }

  onFieldEnter (node) {
    // logDebug('onFieldEnter ', JSON.stringify(node))
    // logDebug('onFieldEnter this.currentTypeInfo.typeDef ', JSON.stringify(this.currentTypeInfo.typeDef))
    // prepere current field info, so onArgumentEnter() can use it
    this.currentField = node
    this.currentrFieldDef = this.currentTypeInfo.typeDef.getFields()[node.name.value]
    if (this.currentrFieldDef) {
      const newTypeDef = getNamedType(this.currentrFieldDef.type)
      this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef }
    } else {
      // logDebug('onSelectionSetEnter is part of the Introspection query')
      return BREAK
    }
  }

  onFieldLeave (node) {
    this.currentTypeInfo = this.currentTypeInfo.parent
  }

  onArgumentEnter (arg) {
    const argName = arg.name.value
    // look for directive and validate argument if directive found
    const argTypeDef = this.currentrFieldDef.args.find(d => d.name === argName)
    const value = valueFromAST(arg.value, argTypeDef.type, this.variableValues)

    // nothing to validate
    if (!value) return

    let variableName
    if (arg.value.kind === Kind.VARIABLE) variableName = arg.value.name.value

    let valueTypeDef = argTypeDef.type
    if (isNonNullType(valueTypeDef)) valueTypeDef = valueTypeDef.ofType

    if (isInputObjectType(valueTypeDef)) {
      const inputObjectTypeDef = getNamedType(valueTypeDef)
      validateInputTypeValue(this.context, inputObjectTypeDef, argName, variableName, value, this.currentField, variableName)
    } else if (isListType(valueTypeDef)) {
      validateArrayTypeValue(this.context, valueTypeDef, argTypeDef, value, this.currentField, argName, variableName, variableName)
    } else {
      const fieldNameForError = variableName || this.currentField.name.value + '.' + argName
      validateScalarTypeValue(this.context, this.currentField, argTypeDef, valueTypeDef, value, variableName, argName, fieldNameForError, '')
    }
  }
}

function validateScalarTypeValue (context, currentQueryField, typeDefWithDirective, valueTypeDef, value, variableName, argName, fieldNameForError, errMessageAt) {
  const directiveArgumentMap = getDirective(context.getSchema(), typeDefWithDirective, 'constraint')?.[0]
  if (directiveArgumentMap) {
    const st = getScalarType(valueTypeDef).scalarType
    const valueDelim = st === GraphQLString ? '"' : ''
    try {
      getConstraintValidateFn(st)(fieldNameForError, directiveArgumentMap, value)
    } catch (e) {
      let error
      if (variableName) {
        error = new ValidationError(fieldNameForError, `Variable "$${variableName}" got invalid value ${valueDelim}${value}${valueDelim}${errMessageAt}. ` + e.message, e.context)
      } else {
        error = new ValidationError(fieldNameForError, `Argument "${argName}" of "${currentQueryField.name.value}" got invalid value ${valueDelim}${value}${valueDelim}${errMessageAt}. ` + e.message, e.context)
      }
      error.originalError = e
      context.reportError(error)
    }
  }
}

function validateInputTypeValue (context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames) {
  // use new visitor to traverse input object structure
  const visitor = new InputObjectValidationVisitor(context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames)
  visit(inputObjectTypeDef.astNode, visitor)
}

function validateArrayTypeValue (context, valueTypeDef, typeDefWithDirective, value, currentField, argName, variableName, iFieldNameFull) {
  let valueTypeDefArray = valueTypeDef.ofType
  if (isNonNullType(valueTypeDefArray)) valueTypeDefArray = valueTypeDefArray.ofType

  let i = 0
  value.forEach(element => {
    const iFieldNameFullIndexed = iFieldNameFull ? `${iFieldNameFull}[${i++}]` : `[${i++}]`
    if (isInputObjectType(valueTypeDefArray)) {
      validateInputTypeValue(context, valueTypeDefArray, argName, variableName, element, currentField, iFieldNameFullIndexed)
    } else {
      const atMessage = ` at "${iFieldNameFullIndexed}"`
      validateScalarTypeValue(context, currentField, typeDefWithDirective, valueTypeDef, element, variableName, argName, iFieldNameFullIndexed, atMessage)
    }
  })
}

class InputObjectValidationVisitor {
  constructor (context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames) {
    this.context = context
    this.argName = argName
    this.variableName = variableName
    this.inputObjectValue = value
    this.inputObjectTypeDef = inputObjectTypeDef
    this.value = value
    this.currentField = currentField
    this.parentNames = parentNames

    this.InputValueDefinition = {
      enter: this.onInputValueDefinition
    }
  };

  onInputValueDefinition (node) {
    // validate InputType argument and print correct error based on whether fields is direct or from variable
    const iFieldName = node.name.value
    const iFieldTypeDef = this.inputObjectTypeDef.getFields()[iFieldName]
    const iFieldNameFull = (this.parentNames ? this.parentNames + '.' + iFieldName : iFieldName)

    const value = this.value[iFieldName]
    if (value) {
      let valueTypeAst = node.type
      if (valueTypeAst.kind === Kind.NON_NULL_TYPE) { valueTypeAst = valueTypeAst.type }
      const valueTypeDef = typeFromAST(this.context.getSchema(), valueTypeAst)

      if (isInputObjectType(valueTypeDef)) {
        validateInputTypeValue(this.context, valueTypeDef, this.argName, this.variableName, value, this.currentField, iFieldNameFull)
      } else if (isListType(valueTypeDef)) {
        validateArrayTypeValue(this.context, valueTypeDef, iFieldTypeDef, value, this.currentField, this.argName, this.variableName, iFieldNameFull)
      } else {
        validateScalarTypeValue(this.context, this.currentField, iFieldTypeDef, valueTypeDef, value, this.variableName, this.argName, iFieldNameFull, ` at "${iFieldNameFull}"`)
      }
    }
  }
}