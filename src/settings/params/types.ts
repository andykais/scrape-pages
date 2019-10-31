import { FMap } from '../../util/map'
import { Omit } from '../../util/types'

// until webpack can load ts-runtime, this is far more convienent than importing the type from '../config/types'
type ScraperName = string

export type Input = { [inputName: string]: string }

export interface ParamsInit {
  input?: Input
  folder: string
  cleanFolder?: boolean
  forceStart?: boolean
}
export type ScrapeParams = Required<Omit<ParamsInit, 'cleanFolder' | 'forceStart'>>
export type FlatParams = FMap<string, ScrapeParams>
