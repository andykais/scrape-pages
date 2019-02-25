import { FMap } from '../../util/map'

// until webpack can load ts-runtime, this is far more convienent than importing the type from '../config/types'
type ScraperName = string

export type Input = { [inputName: string]: string }

export interface ParamsInit {
  input?: Input
  folder: string
  cleanFolder?: boolean
}
export type Params = Required<Omit<ParamsInit, 'cleanFolder'>>
export type FlatParams = FMap<string, Params>
