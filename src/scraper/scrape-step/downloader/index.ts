import { Downloader as IdentityDownloader } from './implementations/identity'
import { Downloader as HttpDownloader } from './implementations/http'
// type imports
import { ScrapeConfig } from '../../../settings/config/types'
import { RunOptions } from '../../../settings/options/types'
import { Tools } from '../../../tools'

export const downloaderClassFactory = (
  config: ScrapeConfig,
  runParams: RunOptions,
  tools: Tools
) => {
  // TODO use type guards
  if (config.download)
    return new HttpDownloader(config, runParams, tools)
  else return new IdentityDownloader(config, runParams, tools)
}
