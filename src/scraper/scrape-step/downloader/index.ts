import { Downloader as IdentityDownloader } from './implementations/identity'
import { Downloader as HttpDownloader } from './implementations/http'
// type imports
import { ScrapeConfig } from '../../../configuration/site-traversal/types'
import { RunOptions } from '../../../configuration/run-options/types'
import { Dependencies } from '../../types'

export const downloaderClassFactory = (
  config: ScrapeConfig,
  runParams: RunOptions,
  dependencies: Dependencies
) => {
  if (config.download)
    return new HttpDownloader(config, runParams, dependencies)
  else return new IdentityDownloader(config, runParams, dependencies)
}
