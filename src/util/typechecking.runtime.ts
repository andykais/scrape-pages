import { createAssertType } from 'typescript-is'
// type imports
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'
import { QueryArguments } from '../tools/store/querier-entrypoint'

const typecheckConfig = createAssertType<ConfigInit>()
const typecheckOptions = createAssertType<OptionsInit>()
const typecheckParams = createAssertType<ParamsInit>()

const typecheckQueryArguments = createAssertType<QueryArguments>()

export { typecheckConfig, typecheckOptions, typecheckParams, typecheckQueryArguments }
