import { createAssertType } from 'typescript-is'
// import { Instructions } from './instructions.ts'
import { Instructions } from './instructions'
import { Querier } from './internal'

const typecheckInstructions = createAssertType<Instructions>()

const typecheckQueryApiLabels = createAssertType<Querier.Labels>()
const typecheckQueryApiOptions = createAssertType<Querier.QueryApiOptions>()

export { typecheckInstructions, typecheckQueryApiLabels, typecheckQueryApiOptions }
