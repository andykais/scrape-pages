import { assertType } from 'typescript-is'
import { QueryArguments } from './'
import { typescriptIsWrapper } from '../../../util/error'

export const assertQueryArgumentsType = typescriptIsWrapper(queryArgs =>
  assertType<QueryArguments>(queryArgs)
)
