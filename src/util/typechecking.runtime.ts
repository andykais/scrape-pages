import { createAssertType } from 'typescript-is'
// type imports
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'

const typecheckConfig = createAssertType<ConfigInit>()
const typecheckOptions = createAssertType<OptionsInit>()
const typecheckParams = createAssertType<ParamsInit>()

export { typecheckConfig, typecheckOptions, typecheckParams }
