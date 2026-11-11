import type {
  ConstraintDirectiveContextEntry,
  ConstraintDirectiveError
} from 'graphql-constraint-directive'

function translateContext (entry: ConstraintDirectiveContextEntry): string {
  switch (entry.arg) {
    case 'minLength':
    case 'maxLength':
    case 'min':
    case 'max':
    case 'exclusiveMin':
    case 'exclusiveMax':
    case 'multipleOf':
    case 'minItems':
    case 'maxItems':
      return `${entry.arg}: ${entry.value}`
    case 'format':
      return `format: ${entry.value}`
    default:
      return `${entry.arg}: ${entry.value}`
  }
}

declare const error: ConstraintDirectiveError

if (error.context[0]) {
  translateContext(error.context[0])
}
