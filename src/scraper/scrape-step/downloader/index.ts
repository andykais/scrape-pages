import { Downloader as IdentityDownloader } from './implementations/identity'
import { Downloader as HttpDownloader } from './implementations/http'
// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName } from '../../../settings/config/types'
import { Tools } from '../../../tools'

export const downloaderClassFactory = (
  scraperName: ScraperName,
  settings: ScrapeSettings,
  tools: Tools
) => {
  const { download } = settings.config
  const { protocol } = download || { protocol: undefined }

  switch (protocol) {
    case 'http':
      return new HttpDownloader(scraperName, download!, settings, tools)
    default:
      return new IdentityDownloader(scraperName, download, settings, tools)
  }
}

export type DownloaderClass = IdentityDownloader | HttpDownloader
