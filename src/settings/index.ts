import { normalizeConfig, flattenConfig } from './config/'
import { normalizeOptions } from './options/'
import { normalizeParams } from './params/'
// type imports
import { ConfigInit, Config, FlatConfig, ScrapeConfig } from './config/types'
import { OptionsInit, FlatOptions, ScrapeOptions } from './options/types'
import { ParamsInit, FlatParams, ScrapeParams } from './params/types'
import { FMap } from '../util/map'

export type Settings = {
  configInit: ConfigInit
  config: Config
  flatConfig: FlatConfig

  optionsInit: OptionsInit
  flatOptions: FlatOptions

  paramsInit: ParamsInit
  flatParams: FlatParams
}

export type ScrapeSettings = {
  config: ScrapeConfig
  options: ScrapeOptions
  params: ScrapeParams
}

export const getSettings = (
  configInit: ConfigInit,
  optionsInit: OptionsInit,
  paramsInit: ParamsInit
): Settings => {
  const config = normalizeConfig(configInit)
  const flatConfig = flattenConfig(config)
  const flatOptions = normalizeOptions(config, optionsInit)
  const flatParams = normalizeParams(config, flatOptions, paramsInit)

  return {
    configInit,
    config,
    flatConfig,

    optionsInit,
    flatOptions,

    paramsInit,
    flatParams
  }
}

export const getScrapeStepSettings = (settings: Settings): FMap<string, ScrapeSettings> =>
  settings.flatConfig.map((_, name) => ({
    config: settings.config.defs[name],
    options: settings.flatOptions.getOrThrow(name),
    params: settings.flatParams.getOrThrow(name)
  }))
