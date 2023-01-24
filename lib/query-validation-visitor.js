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
  visit,
  getDirectiveValues
} = require('graphql')
const ValidationError = require('./error')
const { getConstraintValidateFn, getScalarType } = require('./type-utils')
const { constraintDirectiveTypeDefsObj } = require('./type-defs')

module.exports = class QueryValidationVisitor {
  constructor (context, options) {
    this.context = context
    this.options = options

    this.variableValues = {}

    this.FragmentDefinition = {
      enter: this.onFragmentEnter,
      leave: this.onFragmentLeave
    }

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter
    }

    this.Field = {
      enter: this.onFieldEnter,
      leave: this.onFieldLeave
    }

    this.Argument = {
      enter: this.onArgumentEnter
    }

    this.InlineFragment = {
      enter: this.onFragmentEnter,
      leave: this.onFragmentLeave
    }
  };

  onOperationDefinitionEnter (operation) {
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

  onFragmentEnter (node) {
    const newTypeDef = typeFromAST(this.context.getSchema(), node.typeCondition)
    this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef }
  }

  onFragmentLeave (node) {
    this.currentTypeInfo = this.currentTypeInfo.parent
  }

  onFieldEnter (node) {
    // prepere current field info, so onArgumentEnter() can use it
    this.currentField = node

    // this if handles union type correctly
    if (this.currentTypeInfo.typeDef.getFields) { this.currentrFieldDef = this.currentTypeInfo.typeDef.getFields()[node.name.value] }

    if (this.currentrFieldDef) {
      const newTypeDef = getNamedType(this.currentrFieldDef.type)
      this.currentTypeInfo = { parent: this.currentTypeInfo, typeDef: newTypeDef }
    } else {
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

    if (!argTypeDef) return

    const value = valueFromAST(arg.value, argTypeDef.type, this.variableValues)

    let variableName

    if (arg.value.kind === Kind.VARIABLE) variableName = arg.value.name.value

    let valueTypeDef = argTypeDef.type

    if (isNonNullType(valueTypeDef)) valueTypeDef = valueTypeDef.ofType

    if (isInputObjectType(valueTypeDef)) {
      // nothing to validate
      if (!value) return

      const inputObjectTypeDef = getNamedType(valueTypeDef)

      validateInputTypeValue(this.context, inputObjectTypeDef, argName, variableName, value, this.currentField, variableName)
    } else if (isListType(valueTypeDef)) {
      validateArrayTypeValue(this.context, valueTypeDef, argTypeDef, value, this.currentField, argName, variableName, variableName)
    } else {
      // nothing to validate
      if (!value) return

      const fieldNameForError = variableName || this.currentField.name.value + '.' + argName

      validateScalarTypeValue(this.context, this.currentField, argTypeDef, valueTypeDef, value, variableName, argName, fieldNameForError, '')
    }
  }
}

function validateScalarTypeValue (context, currentQueryField, typeDefWithDirective, valueTypeDef, value, variableName, argName, fieldNameForError, errMessageAt) {
  if (!typeDefWithDirective.astNode) { return }

  const directiveArgumentMap = getDirectiveValues(constraintDirectiveTypeDefsObj, typeDefWithDirective.astNode)

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
  if (!inputObjectTypeDef.astNode) { return }

  // use new visitor to traverse input object structure
  const visitor = new InputObjectValidationVisitor(context, inputObjectTypeDef, argName, variableName, value, currentField, parentNames)

  visit(inputObjectTypeDef.astNode, visitor)
}

function validateArrayTypeValue (context, valueTypeDef, typeDefWithDirective, value, currentField, argName, variableName, iFieldNameFull) {
  if (!typeDefWithDirective.astNode) { return }

  let valueTypeDefArray = valueTypeDef.ofType

  if (isNonNullType(valueTypeDefArray)) valueTypeDefArray = valueTypeDefArray.ofType

  // Validate array/list size
  const directiveArgumentMap = getDirectiveValues(constraintDirectiveTypeDefsObj, typeDefWithDirective.astNode)

  let hasNonListValidation = false

  if (directiveArgumentMap) {
    let errMessageBase

    if (variableName) {
      errMessageBase = `Variable "$${variableName}" at "${iFieldNameFull}" `
    } else {
      errMessageBase = `Argument "${argName}" of "${currentField.name.value}" `
    }

    if (directiveArgumentMap.minItems && (!value || value.length < directiveArgumentMap.minItems)) {
      context.reportError(new ValidationError(iFieldNameFull,
        errMessageBase + `must be at least ${directiveArgumentMap.minItems} in length`,
        [{ arg: 'minItems', value: directiveArgumentMap.minItems }]))
    }
    if (directiveArgumentMap.maxItems && value && value.length > directiveArgumentMap.maxItems) {
      context.reportError(new ValidationError(iFieldNameFull,
        errMessageBase + `must be no more than ${directiveArgumentMap.maxItems} in length`,
        [{ arg: 'maxItems', value: directiveArgumentMap.maxItems }]))
    }

    for (const key in directiveArgumentMap) {
      if (key !== 'maxItems' && key !== 'minItems') {
        hasNonListValidation = true
        break
      }
    }
  }

  // Validate array content
  if (value) {
    value.forEach((element, index) => {
      const iFieldNameFullIndexed = iFieldNameFull ? `${iFieldNameFull}[${index++}]` : `[${index++}]`

      if (isInputObjectType(valueTypeDefArray)) {
        validateInputTypeValue(context, valueTypeDefArray, argName, variableName, element, currentField, iFieldNameFullIndexed)
      } else if (hasNonListValidation) {
        const atMessage = ` at "${iFieldNameFullIndexed}"`

        validateScalarTypeValue(context, currentField, typeDefWithDirective, valueTypeDef, element, variableName, argName, iFieldNameFullIndexed, atMessage)
      }
    })
  }
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

    let valueTypeAst = node.type

    if (valueTypeAst.kind === Kind.NON_NULL_TYPE) { valueTypeAst = valueTypeAst.type }

    const valueTypeDef = typeFromAST(this.context.getSchema(), valueTypeAst)

    if (isInputObjectType(valueTypeDef)) {
      // nothing to validate
      if (!value) return

      validateInputTypeValue(this.context, valueTypeDef, this.argName, this.variableName, value, this.currentField, iFieldNameFull)
    } else if (isListType(valueTypeDef)) {
      validateArrayTypeValue(this.context, valueTypeDef, iFieldTypeDef, value, this.currentField, this.argName, this.variableName, iFieldNameFull)
    } else {
      // nothing to validate
      if (!value && value !== '') return

      validateScalarTypeValue(this.context, this.currentField, iFieldTypeDef, valueTypeDef, value, this.variableName, this.argName, iFieldNameFull, ` at "${iFieldNameFull}"`)
    }
  }
}
