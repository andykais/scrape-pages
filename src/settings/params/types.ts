import { FMap } from '../../util/map'
import { Omit } from '../../util/types'

// until webpack can load ts-runtime, this is far more convienent than importing the type from '../config/types'
type ScraperName = string

export type Input = { [inputName: string]: string }

/** @public */
export interface ParamsInit {
  input?: Input
  folder: string
  cleanFolder?: boolean
}
export type ScrapeParams = Required<Omit<ParamsInit, 'cleanFolder'>>
export type FlatParams = FMap<string, ScrapeParams>
