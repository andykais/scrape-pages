import { Downloader as IdentityDownloader } from './implementations/identity'
import { Downloader as HttpDownloader } from './implementations/http'
// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName, ScrapeConfig } from '../../../settings/config/types'
import { ScrapeOptions } from '../../../settings/options/types'
import { Tools } from '../../../tools'

export const downloaderClassFactory = (
  scraperName: ScraperName,
  settings: ScrapeSettings,
  tools: Tools
) => {
  const { download } = settings.config
  // TODO use type guards
  if (download) return new HttpDownloader(scraperName, download, settings, tools)
  else return new IdentityDownloader(scraperName, download, settings, tools)
}

export type DownloaderClass = IdentityDownloader | HttpDownloader
