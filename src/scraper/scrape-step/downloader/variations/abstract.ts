import { ScrapeConfig } from '../../../../configuration/site-traversal/types'
import { RunOptions } from '../../../../configuration/run-options/types'
import { Dependencies } from '../../../types'
// import { DownloaderType } from '../'

// export const downloader: DownloaderType = config => (
//   runParams,
//   { emitter, store }
// ) => ({ parentId, scrapeNextIndex, incrementIndex, value }) => {
//   const downloadId = store.qs.insertQueuedDownload({
//     scraper: config.name,
//     parentId,
//     scrapeNextIndex,
//     incrementIndex
//   })
//   emitter.forScraper[config.name].emitQueuedDownload(downloadId)
//   return { downloadValue: value, downloadId, filename: null }
// }
export type DownloadParams = {
  parentId?: number
  scrapeNextIndex: number
  incrementIndex: number
  value: string
}

type DownloadData = {}
export abstract class AbstractDownloader {
  config: ScrapeConfig
  runParams: RunOptions
  dependencies: Dependencies

  constructor(
    config: ScrapeConfig,
    runParams: RunOptions,
    dependencies: Dependencies
  ) {
    Object.assign(this, { config, runParams, dependencies })
  }
  run = async (downloadParams: DownloadParams) => {
    const downloadData = this.constructDownload(downloadParams)
    const downloadId = this.dependencies.store.qs.insertQueuedDownload(
      this.config.name,
      downloadParams,
      downloadData
    )
    // this.logger.queuedDownload(downloadId)
    const { downloadValue, filename } = await this.retrieve(
      downloadId,
      downloadData
    )
    return { downloadValue, downloadId, filename }
  }
  // implement these methods
  abstract constructDownload({ value }: DownloadParams): DownloadData
  abstract retrieve(
    downloadId: number,
    downloadParams: DownloadData
  ): { downloadValue: string; filename?: string }
}
