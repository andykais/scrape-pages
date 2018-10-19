import { downloader as urlDownloader } from './variations/url-downloader'
import { downloader as identityDownloader } from './variations/identity-downloader'
// type imports
import { ScrapeConfig } from '../../../configuration/types'
import { RunOptions } from '../../../run-options/types'
import { Dependencies } from '../../types'

export type DownloadParams = {
  parentId?: number
  loopIndex: number
  incrementIndex: number
  value?: string
}
type ReturnType =
  | Promise<{
      downloadValue: string
      downloadId: number
      filename?: string
    }>
  | {
      downloadValue: string
      downloadId: number
      filename: null
    }

export type DownloaderType = (
  config: ScrapeConfig
) => (
  runParams: RunOptions,
  dependencies: Dependencies
) => (downloadParams: DownloadParams) => ReturnType

export default (config: ScrapeConfig) => {
  if (config.download) return urlDownloader(config)
  else return identityDownloader(config)
}
